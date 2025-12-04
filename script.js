// script.js (Versão Corrigida)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const distanceDisplay = document.getElementById('distance');
const highScoreDisplay = document.getElementById('highScore');
const messageArea = document.getElementById('message-area');

// --- Variáveis de Jogo ---
let isPlaying = false;
let gameSpeed = 3;
let score = 0;
let frameCount = 0; // Contador de frames para controlar a criação de obstáculos
let highScore = 0;
let gravity = 0.5;
let lift = -8; 
let gameLoop; // Variável para armazenar o ID do requestAnimationFrame

// --- Objeto Urubu (Personagem) ---
const urubu = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    draw() {
        // Desenha o Urubu (personagem principal)
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Detalhe de bico/olho
        ctx.fillStyle = '#fca311';
        ctx.beginPath();
        ctx.arc(this.x + this.width, this.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    },
    update() {
        this.velocity += gravity;
        this.y += this.velocity;

        // Limita o Urubu
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            if (isPlaying) {
                 gameOver();
            }
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.velocity = lift; 
    }
};

// --- Obstáculos (Barreiras) ---
let obstacles = [];
const obstacleWidth = 50;
const gapHeight = 150; 
const OBSTACLE_INTERVAL = 90; // Frame interval para criar novos obstáculos (ajuste para dificuldade)

function createObstacle() {
    const minHeight = 50;
    const maxHeight = canvas.height - gapHeight - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    obstacles.push({
        x: canvas.width,
        topH: topHeight,
        bottomH: canvas.height - topHeight - gapHeight,
        passed: false 
    });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        // Desenha o obstáculo
        ctx.fillStyle = '#483c32'; 
        ctx.fillRect(obs.x, 0, obstacleWidth, obs.topH); // Topo
        ctx.fillRect(obs.x, obs.topH + gapHeight, obstacleWidth, obs.bottomH); // Base

        // 1. Marca ponto
        if (obs.x + obstacleWidth < urubu.x && !obs.passed) {
            score++;
            obs.passed = true;
            distanceDisplay.textContent = score;
        }

        // 2. Remove obstáculo
        if (obs.x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
        }

        // 3. Detecção de Colisão
        if (
            urubu.x < obs.x + obstacleWidth &&
            urubu.x + urubu.width > obs.x &&
            (urubu.y < obs.topH || urubu.y + urubu.height > obs.topH + gapHeight)
        ) {
            gameOver();
        }
    }
}


// --- Funções de Controle ---

function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    score = 0;
    frameCount = 0;
    urubu.y = canvas.height / 2;
    urubu.velocity = 0;
    obstacles = []; 
    distanceDisplay.textContent = score;
    messageArea.textContent = 'Voando...';
    
    // Agora sim, inicia o loop principal do jogo
    gameUpdate();
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(gameLoop);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('urubuHighScore', highScore);
        highScoreDisplay.textContent = highScore;
        messageArea.textContent = `NOVO RECORDE: ${score}m! 🏆`;
    } else {
        messageArea.textContent = `Fim de Jogo! Distância: ${score}m.`;
    }
}

function gameUpdate() {
    // 1. O requestAnimationFrame deve estar no final para garantir o loop contínuo
    gameLoop = requestAnimationFrame(gameUpdate); 

    if (!isPlaying) return;

    // 2. Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Spawning de Obstáculos
    frameCount++;
    if (frameCount % OBSTACLE_INTERVAL === 0) {
        createObstacle();
    }

    // 4. Atualiza e desenha o Urubu
    urubu.update();
    urubu.draw();

    // 5. Atualiza e desenha os obstáculos
    updateObstacles();
}


// --- Eventos ---

// Carregar High Score
window.onload = () => {
    highScore = localStorage.getItem('urubuHighScore') || 0;
    highScoreDisplay.textContent = highScore;
};

// Botão Iniciar
startButton.addEventListener('click', startGame);

// 'Pulo' do Urubu ao clicar ou pressionar ESPAÇO
const handleFlap = () => {
    if (!isPlaying) {
        startGame(); // Garante que o jogo inicia no primeiro clique/espaço
    }
    urubu.flap();
};

canvas.addEventListener('mousedown', handleFlap);
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); 
        handleFlap();
    }
});