document.addEventListener('DOMContentLoaded', () => {
    renderSkeletons(); // Mostra esqueleto
    lucide.createIcons(); // Inicia ícones do header
    loadData(); // Busca dados
});

let allChallenges = [];
let platformsMap = {};

function renderSkeletons() {
    const grid = document.getElementById('challenges-grid');
    grid.innerHTML = ''; 
    
    // Cria 6 cards de loading
    for (let i = 0; i < 6; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-tag"></div>
            </div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text-short"></div>
        `;
        grid.appendChild(card);
    }
}

async function loadData() {
    try {
        // 1. Carregar Plataformas
        const platformsResponse = await fetch('data/platforms.json');
        const platforms = await platformsResponse.json();
        
        platforms.forEach(p => platformsMap[p.id] = p.name);
        
        // Preencher filtro de plataforma
        const platformSelect = document.getElementById('platform-filter');
        platformSelect.innerHTML = '<option value="all">Todas Plataformas</option>'; 
        platforms.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            platformSelect.appendChild(option);
        });

        // 2. Carregar Desafios
        const challengesResponse = await fetch('data/challenges.json');
        allChallenges = await challengesResponse.json();

        // --- NOVA LÓGICA: Preencher Filtro de Linguagem ---
        const langSelect = document.getElementById('lang-filter');
        langSelect.innerHTML = '<option value="all">Todas Linguagens</option>';
        
        // Cria uma lista única de linguagens (sem repetição)
        const uniqueLangs = [...new Set(allChallenges.map(c => c.language))];
        
        uniqueLangs.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            // Capitaliza a primeira letra (cpp -> Cpp) - Opcional, pode melhorar visualmente depois
            option.textContent = lang; 
            langSelect.appendChild(option);
        });

        // 3. Renderizar e Configurar
        renderChallenges(allChallenges);
        setupFilters();

    } catch (error) {
        console.error("Erro:", error);
        document.getElementById('challenges-grid').innerHTML = 
            `<p style="color: var(--error-color)">Erro ao carregar dados.</p>`;
    }
}

function renderChallenges(challenges) {
    const grid = document.getElementById('challenges-grid');
    grid.innerHTML = '';

    if (challenges.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary)">Nenhum desafio encontrado.</p>';
        return;
    }

    challenges.forEach(challenge => {
        const difficultyMap = {
            'easy': { text: 'Fácil', class: 'easy' },
            'medium': { text: 'Médio', class: 'medium' },
            'hard': { text: 'Difícil', class: 'hard' }
        };
        const diffConfig = difficultyMap[challenge.difficulty] || { text: '?', class: '' };
        const platformName = platformsMap[challenge.platformId] || challenge.platformId;

        const card = document.createElement('article');
        card.className = 'challenge-card';
        card.onclick = () => window.location.href = `code.html?id=${challenge.id}`;

        card.innerHTML = `
            <div class="card-header">
                <h3 class="challenge-title">${challenge.title}</h3>
                <span class="platform-tag">${platformName}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem; flex-grow: 1;">
                ${challenge.description.substring(0, 100)}...
            </p>
            <div class="challenge-info">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="code-2" width="14"></i>
                    <span class="language">${challenge.language}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="bar-chart-2" width="14"></i>
                    <span class="difficulty ${diffConfig.class}">${diffConfig.text}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    lucide.createIcons();
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const platformFilter = document.getElementById('platform-filter');
    const langFilter = document.getElementById('lang-filter'); // Pegamos o elemento

    function applyFilters() {
        const term = searchInput.value.toLowerCase();
        const platform = platformFilter.value;
        const lang = langFilter.value; // Pegamos o valor selecionado

        const filtered = allChallenges.filter(c => {
            const matchesTerm = c.title.toLowerCase().includes(term) || 
                                c.description.toLowerCase().includes(term);
            const matchesPlatform = platform === 'all' || c.platformId === platform;
            
            // --- NOVA LÓGICA: Comparação da Linguagem ---
            const matchesLang = lang === 'all' || c.language === lang;
            
            return matchesTerm && matchesPlatform && matchesLang;
        });

        renderChallenges(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    platformFilter.addEventListener('change', applyFilters);
    langFilter.addEventListener('change', applyFilters); // Adicionamos o evento
}