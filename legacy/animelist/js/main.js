import { qs, on, createElement } from './utils.js';

const API_BASE = 'https://api.jikan.moe/v4';
const container = qs('#anime-container');
const searchForm = qs('#search-form');
const searchInput = qs('#search-input');
const categoryTitle = qs('#category-title');
const modal = qs('#trailer-modal');
const trailerContainer = qs('#trailer-container');
const closeModalBtn = qs('#close-modal');

// --- LAZY LOADING OBSERVER ---
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
                img.src = src;
                // Ao carregar a imagem, remove a classe loading e o blur
                img.onload = () => img.classList.remove('loading');
            }
            observer.unobserve(img);
        }
    });
}, { rootMargin: '50px 0px', threshold: 0.1 });

// --- API FETCH ---
async function fetchAnimes(endpoint) {
    // Limpa o container e adiciona loader sem usar innerHTML (Regra de Segurança)
    container.textContent = '';
    const loaderContainer = createElement('div', { class: 'loader-container' });
    loaderContainer.appendChild(createElement('div', { class: 'loader' }));
    container.appendChild(loaderContainer);
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error('Falha ao buscar animes da Jikan API');
        const data = await response.json();
        renderAnimes(data.data);
    } catch (error) {
        console.error('Erro na requisição:', error);
        container.textContent = '';
        const errorMsg = createElement('p', { class: 'error-message' }, 'Erro ao carregar animes. Tente novamente mais tarde.');
        container.appendChild(errorMsg);
    }
}

// --- RENDER CARDS ---
function renderAnimes(animes) {
    container.textContent = ''; // Limpa o container
    
    if (!animes || animes.length === 0) {
        container.appendChild(createElement('p', { class: 'error-message' }, 'Nenhum anime encontrado.'));
        return;
    }
    
    animes.forEach(anime => {
        // Criar Card
        const card = createElement('div', { class: 'anime-card' });
        
        // Imagem Lazy Loaded
        const imgUrl = anime.images?.webp?.image_url || anime.images?.jpg?.image_url || '';
        const img = createElement('img', { 
            class: 'loading',
            alt: `Capa do anime ${anime.title}`,
            'data-src': imgUrl
        });
        
        // Overlay com sinopse e botão
        const overlay = createElement('div', { class: 'anime-overlay' });
        
        const title = createElement('h3', { class: 'anime-title' }, anime.title);
        
        const synopsisText = anime.synopsis ? anime.synopsis : 'Sinopse não disponível.';
        const synopsis = createElement('p', { class: 'anime-synopsis' }, synopsisText);
        
        // Botão de Trailer
        const trailerUrl = anime.trailer?.embed_url;
        const playBtn = createElement('button', { 
            class: 'btn-play',
            'data-trailer': trailerUrl ? trailerUrl : ''
        }, trailerUrl ? 'Ver Trailer' : 'Trailer Indisponível');
        
        if (!trailerUrl) {
            playBtn.style.opacity = '0.5';
            playBtn.style.cursor = 'not-allowed';
        }
        
        overlay.appendChild(title);
        overlay.appendChild(synopsis);
        overlay.appendChild(playBtn);
        
        card.appendChild(img);
        card.appendChild(overlay);
        
        container.appendChild(card);
        
        // Observar imagem para Lazy Loading
        imageObserver.observe(img);
    });
}

// --- MODAL & IFRAME (Opção A) ---
function openModal(trailerUrl) {
    if (!trailerUrl) return;
    
    trailerContainer.textContent = ''; // Limpa se houver algo
    
    // Injeção dinâmica do iframe (Opção A do plano - Melhora Core Web Vitals)
    // Usar a URL já fornecida pela Jikan com query parameters apropriados
    const embedUrl = new URL(trailerUrl);
    embedUrl.searchParams.set('autoplay', '1');
    
    const iframe = createElement('iframe', {
        src: embedUrl.toString(),
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: 'true'
    });
    
    trailerContainer.appendChild(iframe);
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    trailerContainer.textContent = ''; // Destrói o iframe para parar o vídeo e liberar memória
}

// --- EVENT DELEGATION ---
// Um único listener no container para capturar cliques no botão de play
on(container, 'click', (e) => {
    const btn = e.target.closest('.btn-play');
    if (btn) {
        const trailerUrl = btn.dataset.trailer;
        if (trailerUrl) {
            openModal(trailerUrl);
        }
    }
});

// Eventos do modal
on(closeModalBtn, 'click', closeModal);
on(modal, 'click', (e) => {
    if (e.target === modal) closeModal(); // Fecha se clicar fora do conteúdo
});

// --- SEARCH ---
on(searchForm, 'submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        categoryTitle.textContent = `Resultados para: "${query}"`;
        // Busca animes com termo de pesquisa, filtrando NSFW (sfw=true)
        fetchAnimes(`/anime?q=${encodeURIComponent(query)}&sfw=true`);
    } else {
        categoryTitle.textContent = `Temporada Atual`;
        fetchAnimes('/seasons/now');
    }
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAnimes('/seasons/now');
});
