BEGIN;
ALTER TABLE "Empresa" ADD COLUMN "loginDomain" TEXT;
ALTER TABLE "Usuario" ADD COLUMN "loginInterno" TEXT;
CREATE UNIQUE INDEX "Empresa_loginDomain_key" ON "Empresa"("loginDomain");
CREATE UNIQUE INDEX "Usuario_loginInterno_key" ON "Usuario"("loginInterno");
-- Existing employee identifiers remain usable; no automatic user renaming.
-- Namespace names are stable even if the company's display name changes later.
DO $$
DECLARE e RECORD; base TEXT; candidato TEXT; tentativa INT;
BEGIN
  FOR e IN SELECT id, nome FROM "Empresa" ORDER BY id LOOP
    base := left(regexp_replace(lower(translate(e.nome,
      'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn')), '[^a-z0-9]', '', 'g'), 40);
    IF base = '' THEN base := 'empresa'; END IF;
    candidato := base || '.com'; tentativa := 0;
    WHILE EXISTS (SELECT 1 FROM "Empresa" WHERE "loginDomain" = candidato) LOOP
      tentativa := tentativa + 1;
      candidato := base || '-' || e.id || CASE WHEN tentativa > 1 THEN '-' || tentativa ELSE '' END || '.com';
    END LOOP;
    UPDATE "Empresa" SET "loginDomain" = candidato WHERE id = e.id;
  END LOOP;
END $$;
-- A login cannot impersonate another account's real email, or vice versa.
-- Serialize writes to protect this invariant against concurrent registrations.
CREATE FUNCTION "validarIdentificadoresUsuario"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(2026101924);
  NEW.email := lower(btrim(NEW.email));
  NEW."loginInterno" := NULLIF(lower(btrim(NEW."loginInterno")), '');
  IF EXISTS (SELECT 1 FROM "Usuario" u WHERE u.id IS DISTINCT FROM NEW.id AND (
    lower(u.email) = NEW.email OR lower(u."loginInterno") = NEW.email OR
    (NEW."loginInterno" IS NOT NULL AND (lower(u.email) = NEW."loginInterno" OR lower(u."loginInterno") = NEW."loginInterno"))
  )) THEN
    RAISE EXCEPTION 'Login ou e-mail já utilizado por outra conta' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Usuario_identificadores_unicos" BEFORE INSERT OR UPDATE OF email, "loginInterno"
  ON "Usuario" FOR EACH ROW EXECUTE FUNCTION "validarIdentificadoresUsuario"();
COMMIT;
