# Login industrial e localização da home — 30/10/2026

- Login: imagem industrial estática local, com máquinas de fabricação de aço, iluminação âmbar e contraste para a mensagem. Órbitas, esfera e indicadores decorativos ONLINE/telemetria foram removidos do HTML. Fluxo de autenticação preservado.
- Home: a ação principal agora é Acessar a plataforma, com destino ao login. A referência ao GitHub foi substituída por Explorar equipamentos, com destino à seção de máquinas. Não há formulário ou endereço de contato fictício.
- Localização: catálogo próprio com 186 chaves nos seis idiomas PT, EN, ES, FR, DE e IT. Abrange navegação, títulos, conteúdo, abas, legendas, FAQ, rodapé, metadados e atributos de acessibilidade. A preferência usa idiomaSistema, compartilhada com o login. A legenda acompanha a aba ativa ao mudar idioma. Capturas de tela são imagens ilustrativas do sistema e conservam os pixels originais; legendas e descrições alternativas são traduzidas.

Validação: nove testes de cobertura/regressão da home e login, testes existentes da experiência, verificações estáticas e de integridade. Em DOM simulado, todas as traduções e atributos foram conferidos para os seis idiomas; também foram exercitadas troca de aba, persistência após recarga e indisponibilidade de localStorage. O navegador remoto não alcançou o servidor local de prévia; não foi realizada inspeção visual responsiva em navegador real nesta entrega.

Ativo: frontend/assets/img/login-industry.webp, cerca de 170 KiB. Original gerado com a ferramenta integrada de imagens, sem imagem de terceiros, e convertido para WebP para reduzir transferência. Não depende de URL externa.

Prompt final utilizado (ferramenta integrada, geração nova):

> Use case: photorealistic-natural. Asset type: photographic background for the existing SteelControl industrial monitoring login page. Generate a cinematic, realistic modern steel manufacturing factory interior, automated robotic arms and clean metal fabrication production line, brushed steel machinery, structured overhead beams and subtle amber work lights. No people. Premium industrial editorial photography, charcoal and cool graphite steel with restrained warm amber accents to match an orange industrial brand. Wide landscape image, machinery most legible in the right and lower portions, calmer dark upper-left area with space for white headline overlay. Authentic physical factory, realistic perspective, no futuristic holograms, no 3D globe, no floating balls, no UI, no text, no labels, no logos, no watermark. High quality, restrained and credible.
