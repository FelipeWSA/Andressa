# Andressa & Felipe

Site estático para GitHub Pages. A galeria é carregada automaticamente a partir da pasta [`photos/`](photos/).

## Adicionar fotos

1. Coloque arquivos `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` ou `.avif` em `photos/`. O nome pode ser qualquer um, inclusive com espaços e acentos.
2. Envie os arquivos para a branch `main` do repositório `FelipeWSA/Andressa`.
3. Após o GitHub Pages publicar a alteração, atualize a página. A galeria consulta a lista de arquivos diretamente na API pública do próprio repositório e exibe as fotos em ordem alfabética natural.

Não é preciso editar HTML ou JavaScript para adicionar ou remover fotos. O site precisa continuar público para que a lista seja acessível. Se a API estiver temporariamente indisponível, as sete fotos iniciais continuam sendo exibidas.

Para uma prévia local simples, execute `python -m http.server 8000` na raiz e abra `http://localhost:8000`. A prévia usa as sete fotos iniciais; as novas aparecem automaticamente depois de enviadas ao GitHub.
