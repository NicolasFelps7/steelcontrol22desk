# SteelControl · Central industrial 3D

Desktop baseado no commit ce8d85e; Flutter 1.22.0+55. Cena WebGL real, com geometria por família e sem fotografia de fábrica no dashboard. O login mobile continua sem fotografia; a imagem de login do desktop permanece.

## Atualizar

1. No Windows, execute ATUALIZAR_3D_STEELCONTROL.ps1 na cópia clonada de steelcontrol22desk. Exige branch main, árvore limpa e autor Git configurado. Faz pull --ff-only, aplica a alteração, confere manifesto e referências, cria commit e faz push sem reset/force push.
2. Aguarde o Railway concluir o deploy e abra /app/dashboard com Ctrl+F5. Esta entrega não adiciona migration: a tabela de produção da entrega anterior permanece.
3. No Flutter, extraia SteelControlMOBILE-atualizado.zip em pasta nova. Execute flutter pub get, depois scripts/verify-mobile.ps1. A nova dependência é webview_flutter 4.14.1, com visualizador local. Android mínimo 24; mantenha Android System WebView atualizado. O APK deve ser recompilado e instalado no tablet; Railway não atualiza o aplicativo instalado.

## Novo fluxo integrado

A entrada do dashboard e os antigos endereços de painel abrem a Central industrial. A página antiga foi substituída por um encaminhamento; não há botão para retornar ao dashboard antigo. Os componentes de controle são reaproveitados dentro da nova área da máquina.

- Arraste para orbitar, use roda/pinça para zoom e clique/toque para selecionar. Barra de ferramentas: aproximar, afastar, visão geral, foco e malha 3D. Inspecionar em 3D amplia a visualização sem os cartões sobrepostos.
- O seletor de equipamentos e a seleção no cenário atualizam os indicadores. No desktop, Área da máquina reúne estado, controle, manutenção, alertas e conexão. No mobile a área integra controle, produção, manutenção, alertas e logs com acesso por cargo.
- Dobot mantém JOG e ciclo supervisionado por pontos ensinados, sem iniciar movimento ao abrir a tela. IHM e impressora usam as rotas e autorizações existentes. A visualização não possui endpoint para mover hardware.
- Cadastro: escolha Família física / modelo 3D e confira a prévia. Modelo do fabricante, controlador e protocolo permanecem separados. Máquinas antigas são classificadas pelo tipo e, na ausência de um tipo reconhecido, nome/modelo/controlador. Um tipo desconhecido usa representação genérica.

## Modelos e fidelidade

15 famílias: Dobot Magician, robô industrial, esteira, injetora, fresadora CNC, torno CNC, prensa, impressora 3D, embaladora, envasadora, célula de solda, compressor, forno, painel CLP e equipamento genérico. Cada família tem malhas próprias, materiais em grafite/aço e detalhes em laranja SteelControl. Os modelos são representativos, não arquivos CAD dimensionais nem plantas calibradas da empresa.

Os equipamentos aparecem apenas quando cadastrados; nenhum parque demonstrativo é injetado. A planta organiza as máquinas visualmente, sem inferir posição física. Juntas do braço só atualizam com medições finitas de equipamento real online. A geometria não constitui solução de cinemática ou previsão de colisão validada.

O motor e os modelos são arquivos locais, sem CDN, modelos externos ou downloads por equipamento. O contrato do visualizador recebe apenas identificação, tipo, estado e juntas; não recebe credenciais. Nomes usam textContent; navegação da WebView fica restrita ao arquivo local e CSP bloqueia conexões de rede da cena.

Por desempenho, a cena exibe até 24 equipamentos no desktop ou 12 no tablet simultaneamente; uma seleção fora desse conjunto entra na cena e os demais continuam acessíveis pelo seletor da central (limite de 100 equipamentos da API). Renderização sob demanda, limite de resolução e pausa em segundo plano reduzem consumo. Sem WebGL, aparece mensagem de indisponibilidade; não é substituído por uma imagem.

## Fonte 1: telemetria

Não são gerados valores demonstrativos no código de produção. Um traço acompanhado de “Sem dados” significa ausência de medição confirmada, e não zero. Máquinas em simulação não alimentam os indicadores reais.

A API interpreta contadores acumulados enviados em `dadosExtras.operacao.contadores` nas leituras reais. Exemplo de contrato (os números devem vir do processo):

```json
{
  "dadosExtras": {
    "operacao": {
      "contadores": {
        "fabricados": 150,
        "rejeitados": 3,
        "ciclos": 160,
        "pedidos": 170,
        "embalagem": 145,
        "notasFiscais": 30,
        "distribuicao": 140,
        "producaoSegundos": 3600,
        "paradaSegundos": 120,
        "manutencaoSegundos": 60,
        "metaUnidades": 180
      }
    }
  }
}
```

Esse bloco acompanha a telemetria já autenticada do equipamento/Edge. Não foi criado um acesso de dispositivo sem credencial. As contagens são inteiras; tempos são em segundos. Os contadores representam totais acumulados; o painel calcula deltas dentro da janela, usa a última amostra anterior como base e trata redução como reinício. Sem base anterior, a parcela desconhecida é sinalizada; não se extrapola produção que não foi observada.

O campo legado `producao` só é interpretado como quantidade fabricada em equipamentos fora do perfil Dobot quando o cadastro contém `integracaoMeta.operacao.producaoConfirmada=true`. Use isso apenas quando a origem desse contador tiver sido verificada. `ciclos` exige `ciclosConfirmados=true`, contador explícito ou perfil Dobot. Isso evita transformar defaults do banco em medições.

No gateway Dobot atual, `producao` aumenta por movimento PTP concluído. Por isso ele não é usado automaticamente como produto fabricado. Os ciclos continuam disponíveis como movimentos observados; para peças acabadas, envie o contador explícito do processo ou use registros de turno.

Esteiras são identificadas por nome/tipo/controlador contendo “esteira” ou “conveyor”; injetoras por “injet” ou “inject”. Cadastre os equipamentos com identificação correspondente.

## Fonte 2: registros de turno

Administradores, supervisores e técnicos podem registrar totais reais de um turno para uma máquina fora de simulação. Visitantes e operadores consultam os indicadores, mas não gravam registros.

- Preencha data/hora, equipamento e apenas os indicadores conhecidos. Campos vazios permanecem desconhecidos; zero deve ser digitado quando confirmado.
- Cada registro contém incrementos daquele turno, não o total acumulado desde o início da máquina. A meta é a quantidade planejada para aquele registro.
- Preencha os campos relacionados no mesmo registro para calcular percentuais/tempos. Não se calcula desperdício juntando fabricados de um turno com rejeitados de outro turno incompleto.
- Reenvios do mesmo formulário conservam o identificador e não duplicam o lançamento. Alterar os valores inicia um novo identificador. Reabrir o formulário representa um novo lançamento; confira os registros recentes antes de lançar o mesmo turno novamente.
- A remoção é lógica, aparece na auditoria e retira o registro dos totais. O identificador removido não pode ser reaproveitado para recriar um lançamento.
- Telemetria e registros de turno são fontes separadas; não são somados entre si para evitar dupla contagem.
- Pedidos/notas fiscais/distribuição são contagens informadas pelo processo ou pelo responsável. O painel não emite nota fiscal, não altera pedidos de um ERP e não simula uma integração de faturamento inexistente. Registre cada evento de negócio uma única vez.

## Cálculos

- Tempo por unidade = segundos produzindo / produtos fabricados.
- Desperdício = rejeitados / (fabricados + rejeitados) × 100.
- Unidades/hora = fabricados / segundos produzindo × 3600.
- Meta atingida = fabricados / meta do período × 100; pode ultrapassar 100%.
- As razões só aparecem quando os campos necessários estão presentes em fontes compatíveis. Campos parciais não são preenchidos artificialmente.

## Segurança e limites

As rotas `/empresa/operacao` passam pela autenticação existente, rechecagem de sessão/empresa e proteção de origem para cookies. O banco filtra por empresa e máquinas ativas. Escritas verificam cargo e propriedade do equipamento, rejeitam dados inválidos, possuem limite de tentativas e chave de idempotência por empresa. A consulta histórica usa SQL parametrizado, limite de consultas por usuário e prazo de 8 segundos no banco. Registros nunca enviam comandos ao robô.

Os componentes de comando existentes foram incorporados à área da máquina na central; as verificações de permissão e as proteções do Edge continuam ativas. O cenário não aciona equipamentos quando selecionado. A supervisão do processo não substitui os sistemas físicos de segurança.

## Validação da entrega

Verificados neste ambiente: testes do backend incluindo isolamento por empresa, cargos, comandos, idempotência, SQL PostgreSQL via PGlite e rotas HTTP; testes das 15 geometrias reais Three.js (vértices finitos, volumes, raycast/seleção, classificação, pose e torres de estado); whitelisting de telemetria para a cena; referências estáticas e manifesto de freeze.

O SDK Dart verificou a sintaxe/formatação dos arquivos alterados. Não há Flutter/engine completo disponível para flutter analyze, testes de widgets ou geração de APK. Aceleração gráfica e interação WebGL não foram testadas em navegador nem no Galaxy Tab neste ambiente; valide no dispositivo antes de usar a entrega em uma apresentação ou operação. Os testes de backend usam o Node disponível aqui; projeto/Docker continuam em Node 22.

Não foram enviados comandos a hardware. A visualização e os controles por software não substituem parada física, intertravamentos e supervisão local.
