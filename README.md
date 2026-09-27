# Andressa & Felipe

Site estático para GitHub Pages. A galeria é carregada automaticamente a partir da pasta [`Fotos/`](Fotos/).

## Adicionar fotos

1. Abra a pasta `Fotos/` no repositório e envie quantas imagens quiser de uma vez. São aceitos `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` e `.avif`, com qualquer nome, inclusive espaços e acentos.
2. Confirme o envio para a branch `main` do repositório `FelipeWSA/Andressa`.
3. Após o GitHub Pages publicar a alteração, atualize a página. A galeria consulta a lista de arquivos diretamente na API pública do próprio repositório e exibe todas as fotos em ordem alfabética natural.

Não é preciso editar HTML ou JavaScript, nem renomear imagens, para adicionar ou remover fotos. O site precisa continuar público para que a lista seja acessível. Se a API estiver temporariamente indisponível, as sete fotos iniciais continuam sendo exibidas.

Para uma prévia local, execute `python -m http.server 8000` na raiz e abra `http://localhost:8000`. A prévia lê todos os arquivos da pasta `Fotos/` ao carregar a página; atualize a página depois de adicionar imagens. Se usar outro servidor que não liste diretórios, a prévia recorre às sete fotos iniciais.
