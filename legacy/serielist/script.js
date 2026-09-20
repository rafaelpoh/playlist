// NOTA: É uma boa prática manter chaves de API em um ambiente seguro e não diretamente no código.
const apiKey = '4470f5b73e6ecdfd6ba10fd320853bd0';

// URLs base
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const apiBaseUrl = 'https://api.themoviedb.org/3';

// Elementos do DOM
const mainContent = document.querySelector('main');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const trailerModal = document.getElementById('trailer-modal');
const trailerIframe = document.getElementById('trailer-iframe');
const closeButton = document.querySelector('.close-button');

// Função para exibir as séries na tela
function displaySeries(series, container) {
    container.innerHTML = ''; // Limpa o container

    if (series.length === 0) {
        container.innerHTML = '<p>Nenhuma série encontrada.</p>';
        return;
    }

    series.forEach(serie => {
        if (serie.poster_path) {
            const serieCard = document.createElement('div');
            serieCard.classList.add('movie-card'); // Manter a classe para o estilo
            serieCard.dataset.serieId = serie.id; // Adiciona o ID da série ao card

            serieCard.addEventListener('click', () => {
                console.log(`Card clicado! ID da série: ${serie.id}`);
                openTrailerModal(serie.id);
            });

            const serieImage = document.createElement('img');
            serieImage.src = `${imageBaseUrl}${serie.poster_path}`;
            serieImage.alt = serie.name;

            const serieInfo = document.createElement('div');
            serieInfo.classList.add('movie-card-info');

            const serieTitle = document.createElement('h2');
            serieTitle.classList.add('movie-title');
            serieTitle.textContent = serie.name;

            serieInfo.appendChild(serieTitle);
            serieCard.appendChild(serieImage);
            serieCard.appendChild(serieInfo);

            container.appendChild(serieCard);
        }
    });
}

// Função para buscar dados da API e chamar a exibição
async function fetchAndPopulateSeries(endpoint, container) {
    const apiUrl = `${apiBaseUrl}${endpoint}&api_key=${apiKey}&language=pt-BR&page=1`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        const data = await response.json();
        displaySeries(data.results, container);
    } catch (error) {
        console.error(`Erro ao buscar séries:`, error);
        container.innerHTML = '<p>Não foi possível carregar as séries.</p>';
    }
}

// Função para mostrar a visualização padrão (Séries no ar e Populares)
function showDefaultView() {
    mainContent.innerHTML = `
        <section class="movie-category">
            <h2>Séries no Ar</h2>
            <div id="on-the-air-container" class="movie-grid"></div>
        </section>
        <section class="movie-category">
            <h2>Séries Populares</h2>
            <div id="popular-container" class="movie-grid"></div>
        </section>
    `;
    const onTheAirContainer = document.getElementById('on-the-air-container');
    const popularContainer = document.getElementById('popular-container');

    fetchAndPopulateSeries(`/tv/on_the_air?`, onTheAirContainer);
    fetchAndPopulateSeries(`/tv/popular?`, popularContainer);
}

// Função para buscar e mostrar os resultados da pesquisa
function showSearchResults(query) {
    mainContent.innerHTML = `
        <section class="movie-category">
            <h2>Resultados para "${query}"</h2>
            <div id="search-results-container" class="movie-grid"></div>
        </section>
    `;
    const searchResultsContainer = document.getElementById('search-results-container');
    fetchAndPopulateSeries(`/search/tv?query=${encodeURIComponent(query)}`, searchResultsContainer);
}

// Event listener para o formulário de busca
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
        showSearchResults(searchTerm);
    } else {
        showDefaultView(); // Se a busca for vazia, volta para a tela inicial
    }
    searchInput.value = ''; // Limpa o input
});

// Carregamento inicial
document.addEventListener('DOMContentLoaded', showDefaultView);

// Funções do Modal de Trailer
async function openTrailerModal(serieId) {
    const apiUrl = `${apiBaseUrl}/tv/${serieId}/videos?api_key=${apiKey}&language=pt-BR`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro na API de vídeos: ${response.statusText}`);
        const data = await response.json();
        
        // Procura por um trailer oficial no YouTube
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

        if (trailer && trailer.key) {
            trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            trailerModal.style.display = 'flex';
        } else {
            alert('Trailer não disponível para esta série.');
        }
    } catch (error) {
        console.error('Erro ao buscar trailer:', error);
        alert('Não foi possível carregar o trailer.');
    }
}

function closeTrailerModal() {
    trailerModal.style.display = 'none';
    trailerIframe.src = ''; // Para o vídeo ao fechar
}

// Event Listeners para fechar o modal
closeButton.addEventListener('click', closeTrailerModal);

trailerModal.addEventListener('click', (event) => {
    // Fecha o modal se o clique for no fundo (fora do conteúdo)
    if (event.target === trailerModal) {
        closeTrailerModal();
    }
});
