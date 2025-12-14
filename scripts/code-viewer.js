document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); // Inicia ícones estáticos (header, voltar)
    loadSolution();
});

async function loadSolution() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.getElementById('loading-msg').textContent = "ID não especificado.";
        return;
    }

    try {
        const response = await fetch('data/challenges.json');
        const challenges = await response.json();
        const challenge = challenges.find(c => c.id === id);

        if (!challenge) throw new Error("Desafio não encontrado.");

        // Preencher dados
        document.getElementById('challenge-title').textContent = challenge.title;
        document.getElementById('meta-platform').textContent = challenge.platformId;
        
        const diffElement = document.getElementById('meta-difficulty');
        diffElement.textContent = challenge.difficulty.toUpperCase();
        diffElement.className = `difficulty ${challenge.difficulty}`;

        document.getElementById('file-name').textContent = challenge.solutionFile;

        const btnExternal = document.getElementById('external-link');
        if (challenge.link) {
            btnExternal.href = challenge.link;
            btnExternal.style.display = 'inline-flex'; // Mostra se tiver link
        } else {
            btnExternal.style.display = 'none'; // Esconde se não tiver
        }

        // Buscar código
        const codePath = `solutions/${challenge.platformId}/${challenge.language}/${challenge.solutionFile}`;
        const codeResponse = await fetch(codePath);
        if (!codeResponse.ok) throw new Error("Arquivo de código não encontrado.");
        
        const codeText = await codeResponse.text();

        const codeBlock = document.getElementById('code-block');
        codeBlock.textContent = codeText;
        codeBlock.className = `language-${challenge.language}`;
        
        hljs.highlightElement(codeBlock);

        document.getElementById('loading-msg').style.display = 'none';
        document.getElementById('solution-content').style.display = 'block';
        
        // Recarrega ícones (caso algum tenha sido injetado dinamicamente, embora aqui não precise, é boa prática)
        lucide.createIcons();

    } catch (error) {
        console.error(error);
        document.getElementById('loading-msg').innerHTML = `<span style="color: var(--error-color)">Erro: ${error.message}</span>`;
    }
}

function copyCode() {
    const code = document.getElementById('code-block').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.btn-copy');
        // Muda visualmente para indicar sucesso
        btn.innerHTML = `<i data-lucide="check" width="14"></i> <span>Copiado!</span>`;
        lucide.createIcons(); // Renderiza o ícone de check novo
        
        setTimeout(() => {
            btn.innerHTML = `<i data-lucide="copy" width="14"></i> <span>Copiar Código</span>`;
            lucide.createIcons(); // Volta o ícone original
        }, 2000);
    });
}