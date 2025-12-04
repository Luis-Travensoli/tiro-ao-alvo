// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');

// Variáveis do Jogo
let score = 0;
let timeRemaining = 60;
let lives = 3;
let isPlaying = false;
let gameLoop;
let target = {}; // Objeto que conterá as propriedades do alvo (x, y, raio, velocidade)

// --- Funções de Lógica ---

function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    score = 0;
    timeRemaining = 60;
    lives = 3;

    // Inicializa o alvo
    initializeTarget();

    // Atualiza o painel de informações
    updateInfoPanel();

    // Inicia o loop do jogo e o timer
    gameLoop = requestAnimationFrame(gameUpdate);
    startTimer();
}

function initializeTarget() {
    // Implemente a lógica para posicionar o alvo aleatoriamente
    // Exemplo:
    target.x = Math.random() * (canvas.width - 50) + 25;
    target.y = Math.random() * (canvas.height - 50) + 25;
    target.radius = 20;
    target.vx = (Math.random() - 0.5) * 2; // Velocidade aleatória em X
    target.vy = (Math.random() - 0.5) * 2; // Velocidade aleatória em Y
}

function drawTarget() {
    // Desenha o alvo no canvas
    // 

[Image of shooting target on a canvas]

    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

function gameUpdate() {
    // 1. Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Atualiza a posição do alvo
    target.x += target.vx;
    target.y += target.vy;

    // 3. Verifica colisão com as bordas (ricochete)
    if (target.x + target.radius > canvas.width || target.x - target.radius < 0) {
        target.vx = -target.vx;
    }
    if (target.y + target.radius > canvas.height || target.y - target.radius < 0) {
        target.vy = -target.vy;
    }

    // 4. Desenha o alvo
    drawTarget();

    // 5. Continua o loop do jogo se estiver jogando
    if (isPlaying) {
        requestAnimationFrame(gameUpdate);
    }
}

// ... Outras funções (handleShoot, startTimer, updateInfoPanel, gameOver) ...

// Event Listeners
startButton.addEventListener('click', startGame);

// Exemplo de como detectar o tiro (clique)
canvas.addEventListener('click', (event) => {
    if (!isPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Cálculo da distância entre o clique e o centro do alvo
    const distance = Math.sqrt((clickX - target.x) ** 2 + (clickY - target.y) ** 2);

    if (distance < target.radius) {
        // ACERTOU!
        score += 10;
        updateInfoPanel();
        initializeTarget(); // Reposiciona o alvo
    }
    // Você pode subtrair uma vida se errar o alvo, para um jogo mais difícil.
});