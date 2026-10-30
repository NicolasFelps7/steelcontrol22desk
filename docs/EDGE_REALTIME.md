# Edge: lista sincronizada e cadastro sem janela de chave

A lista do Edge agora consome os eventos autenticados da empresa já enviados em `/empresa/stream`.
Criação e edição reconciliam a lista; exclusão remove o cartão ao receber o evento e fecha a configuração aberta daquela máquina.
As janelas do mesmo perfil também recebem a notificação local após a API confirmar a alteração.
Uma resposta HTTP iniciada antes do evento não pode recriar cartões antigos. Cadastros removidos permanecem excluídos dessa sessão.

A reconexão do stream, o retorno de foco e uma conferência a cada cinco segundos recuperam eventos perdidos.
A atualização normal depende da chegada do evento e da rede; a conferência periódica é recuperação, não a atualização principal.
O servidor mantém a autorização e as credenciais. Esta mudança não envia comandos físicos nem altera o controle do robô.

Após cadastrar/editar equipamento, não há mais a janela automática com Device Key nem a ação antiga de copiar pacote para o Edge.
O cadastro mostra uma confirmação; use Configurar Edge no cartão para escolher computador e COM.
Para dispositivos que enviam diretamente à API sem o Edge, a opção Integração manual de dispositivo permite gerar a chave sob demanda.
Essa opção fica oculta em simulação e quando existe uma conexão Edge ativa, para evitar invalidar a credencial do Edge.

## Aplicação

O patch foi preparado sobre `5560f899`, que já contém a correção SQL anterior.
Atualize a branch main, aplique os arquivos e envie ao GitHub para o Railway fazer deploy.
Depois do deploy, recarregue a página de máquinas e a janela do Edge (Ctrl+R).
Não há migration, atualização de driver nem reinstalação do componente local nesta alteração.

## Validação

- 183 testes Node aprovados, incluindo 8 novos casos do consumidor de eventos.
- Casos novos: exclusão antes da próxima resposta, resposta antiga, criação/edição, reconexão e fallback, rajada de eventos, isolamento por empresa, falha de rede e notificações sem credenciais.
- Teste de navegador com API simulada em duas janelas: cadastro apareceu no Edge sem atualizar; exclusão retirou o cartão e fechou o diálogo de configuração aberto.
- Referências estáticas, manifesto de integridade e verificação de segredos aprovados.
- Sem alteração direta no GitHub/Railway; o push é feito pela autenticação do proprietário no PC.
- Não foi validada comunicação com um Dobot físico nesta tarefa.
