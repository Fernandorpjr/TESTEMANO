# Mano Assistant - Publicação

Esta é a versão final e publicável do Mano Assistant, um assistente pessoal web para automação de tarefas no Sisreg III.

## Arquivos Essenciais para Publicação

1. `index.html` - Página principal da aplicação
2. `styles.css` - Folha de estilos da aplicação
3. `script.js` - Lógica principal da aplicação
4. `README.md` - Este documento

## Funcionalidades

- Ativação/desativação do assistente
- Upload de imagens via arrastar e soltar ou seleção de arquivo
- Processamento OCR real usando Tesseract.js
- Extração automática de dados do paciente:
  - Nome completo
  - Cartão Nacional de Saúde (CNS)
  - Data de nascimento
  - Telefone
  - Procedimento solicitado
- Visualização do texto OCR escaneado
- **Integração completa com o Sisreg III**
- Cópia do texto OCR para a área de transferência
- Log de ações em tempo real
- Comandos por texto

## Como Usar

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Clique no botão "Ativar" para ativar o assistente
3. Carregue uma imagem contendo dados de paciente:
   - Clique na área de upload e selecione um arquivo, ou
   - Arraste e solte uma imagem na área de upload
4. O OCR será processado automaticamente
5. Utilize os botões de comando para interagir com o Sisreg:
   - "Acessar Sisreg" - Abre o sistema Sisreg III
   - "Preencher Formulário" - Preenche os dados do paciente
   - "Buscar Vaga" - Busca vagas disponíveis
   - "Agendar Consulta" - Agenda uma consulta
   - "Processo Completo" - Executa todas as etapas

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexão com a internet (para carregar as bibliotecas externas)

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Tesseract.js (para OCR)
- Font Awesome (ícones)

## Notas Importantes

- O assistente processa o conteúdo real da imagem, não apenas o nome do arquivo
- O OCR pode levar alguns segundos dependendo do tamanho e qualidade da imagem
- Funciona com documentos em português
- Os dados são processados localmente no navegador, não são enviados para nenhum servidor
- **A integração com o Sisreg III agora inclui visualização direta no iframe**
- A integração com o Sisreg III pode ter limitações devido a restrições de segurança de sites em iframes

## Solução de Problemas

Se o assistente não estiver funcionando:

1. Verifique se o assistente está ativado
2. Certifique-se de que a imagem foi carregada corretamente
3. Verifique se há mensagens de erro no log de ações
4. Confirme se está usando um navegador moderno com suporte a JavaScript

Se o Sisreg não estiver carregando:
- Isso pode acontecer devido a restrições de segurança do próprio site
- O Sisreg pode não permitir ser carregado em iframes por razões de segurança
- Neste caso, o assistente ainda funciona para OCR e extração de dados

## Publicação

Para publicar este assistente:

1. Compacte toda a pasta `mano-assistant-publish` em um arquivo ZIP
2. Envie para qualquer serviço de hospedagem web estática
3. Ou simplesmente coloque a pasta em qualquer servidor web e acesse o index.html

Todos os arquivos necessários estão incluídos nesta pasta.