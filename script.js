// script.js
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
let highScore = 0;
let gravity = 0.5;
let lift = -8; // Força do 'pulo' ou batida de asa
let gameLoop;

// --- Objeto Urubu (Personagem) ---
const urubu = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    draw() {
        // Desenha o Urubu (simples, como um triângulo ou retângulo estilizado)
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Adiciona um 'olho' ou detalhe para parecer mais elaborado
        ctx.fillStyle = '#fca311';
        ctx.beginPath();
        ctx.arc(this.x + this.width, this.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    },
    update() {
        // Aplica a gravidade
        this.velocity += gravity;
        this.y += this.velocity;

        // Limita o Urubu à parte superior e inferior do canvas
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            // FIM DE JOGO: Tocou no chão
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
        this.velocity = lift; // Aplica a força de 'pulo' para cima
    }
};

// --- Obstáculos (Barreiras) ---
let obstacles = [];
const obstacleWidth = 50;
const gapHeight = 150; // Tamanho da abertura para o urubu passar
let obstacleSpawnInterval = 100; // A cada 100 frames um novo obstáculo

function createObstacle() {
    const minHeight = 50;
    const maxHeight = canvas.height - gapHeight - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    obstacles.push({
        x: canvas.width,
        topH: topHeight,
        bottomH: canvas.height - topHeight - gapHeight,
        passed: false // Se o urubu já passou por este obstáculo
    });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        // Desenha o obstáculo
        ctx.fillStyle = '#483c32'; // Cor de um tronco ou montanha
        
        // Parte superior do obstáculo
        ctx.fillRect(obs.x, 0, obstacleWidth, obs.topH);
        
        // Parte inferior do obstáculo
        ctx.fillRect(obs.x, obs.topH + gapHeight, obstacleWidth, obs.bottomH);

        // Verifica se o Urubu marcou ponto (passou pelo obstáculo)
        if (obs.x + obstacleWidth < urubu.x && !obs.passed) {
            score++;
            obs.passed = true;
            distanceDisplay.textContent = score;
        }

        // Remove obstáculos que saíram da tela
        if (obs.x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
        }

        // --- Detecção de Colisão ---
        if (
            urubu.x < obs.x + obstacleWidth &&
            urubu.x + urubu.width > obs.x &&
            (urubu.y < obs.topH || urubu.y + urubu.height > obs.topH + gapHeight)
        ) {
            // COLISÃO! FIM DE JOGO
            gameOver();
        }
    }

    // Lógica para gerar novos obstáculos
    if (score % obstacleSpawnInterval === 0 && score > 0) {
        createObstacle();
    }
}


// --- Funções de Controle ---

function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    score = 0;
    urubu.y = canvas.height / 2;
    urubu.velocity = 0;
    obstacles = []; // Limpa os obstáculos
    distanceDisplay.textContent = score;
    messageArea.textContent = 'Voando...';
    
    // Inicia o loop principal do jogo
    gameLoop = requestAnimationFrame(gameUpdate);
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
    if (!isPlaying) return;

    // 1. Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Atualiza e desenha o Urubu
    urubu.update();
    urubu.draw();

    // 3. Cria e movimenta os obstáculos
    updateObstacles();

    // 4. Continua o loop do jogo
    requestAnimationFrame(gameUpdate);
}


// --- Eventos ---

// Carregar High Score
window.onload = () => {
    highScore = localStorage.getItem('urubuHighScore') || 0;
    highScoreDisplay.textContent = highScore;
    createObstacle(); // Cria o primeiro obstáculo para começar
};

// Botão Iniciar
startButton.addEventListener('click', startGame);

// 'Pulo' do Urubu ao clicar ou pressionar ESPAÇO
const handleFlap = () => {
    if (!isPlaying) {
        startGame();
    }
    urubu.flap();
};

canvas.addEventListener('mousedown', handleFlap);
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // Impede a rolagem da tela ao pressionar espaço
        handleFlap();
    }
});