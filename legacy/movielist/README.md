# MovieList: Sua Lista de Filmes

MovieList é uma aplicação web simples para explorar filmes, ver os que estão em cartaz, os próximos lançamentos e buscar por títulos específicos. Além disso, é possível assistir aos trailers dos filmes diretamente na aplicação.

## Funcionalidades

*   **Filmes em Cartaz:** Veja uma lista dos filmes atualmente em exibição.
*   **Próximos Lançamentos:** Descubra os filmes que serão lançados em breve.
*   **Busca de Filmes:** Procure por qualquer filme usando a barra de pesquisa.
*   **Visualização de Trailers:** Clique em qualquer card de filme para abrir um pop-up e assistir ao trailer (quando disponível).

## Tecnologias Utilizadas

*   **HTML5:** Estrutura da página web.
*   **CSS3:** Estilização e responsividade da interface.
*   **JavaScript (ES6+):** Lógica da aplicação, interação com a API e manipulação do DOM.
*   **The Movie Database (TMDb) API:** Para buscar informações sobre filmes e trailers.

## Como Rodar o Projeto

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório** (se aplicável, ou baixe os arquivos).
2.  **Abra o arquivo `index.html`** em seu navegador web preferido.

    *   Você pode simplesmente arrastar o arquivo `index.html` para a janela do navegador ou clicar duas vezes nele.

**Nota:** Certifique-se de ter uma conexão com a internet, pois a aplicação busca dados da TMDb API.

## Estrutura do Projeto

*   `index.html`: O arquivo principal HTML que define a estrutura da página.
*   `style.css`: Contém todos os estilos CSS para a aplicação.
*   `script.js`: Contém a lógica JavaScript para buscar dados da API, exibir filmes, lidar com a busca e gerenciar o modal de trailers.
*   `movie.png`: O ícone/logo utilizado no cabeçalho da aplicação.

## Organização do Código

O código está organizado em três arquivos principais para facilitar a manutenção:

*   **HTML (`index.html`):** Define a estrutura semântica da página, incluindo o cabeçalho, seções de filmes e o modal de trailer.
*   **CSS (`style.css`):** Responsável pela apresentação visual, garantindo um design moderno e responsivo.
*   **JavaScript (`script.js`):** Gerencia a interatividade, desde a busca de filmes até a exibição dinâmica dos trailers. As funções são modularizadas para clareza e reusabilidade.

---
