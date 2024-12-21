let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 512;
let velY = 0; // Початкова вертикальна швидкість
let gravity = 0.2; // Гравітація
let bird = new Image();
bird.src = "img/bird.png";
let back = new Image();
back.src = "img/back.png";
let pipeBottom = new Image();
pipeBottom.src = "img/pipeBottom.png";
let pipeUp = new Image();
pipeUp.src = "img/pipeUp.png";
let road = new Image();
road.src = "img/road.png";
let fly = new Audio();
fly.src = "audio/fly.mp3";
let scoreAudio = new Audio();
scoreAudio.src = "audio/score.mp3";
let xPos = 10;
let yPos = 150;
let gap = 110;
let pipes = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
let isPaused = false; // Змінна для відстеження стану паузи
let animationID; // Для зберігання ідентифікатора анімації
document.getElementById('best-score').textContent = bestScore;
// Початкова труба
pipes[0] = {
    x: canvas.width,
    y: getRandomPipeHeight()
};
// Функція для стрибка (підйому пташки)
function moveUp() {
    if (!isPaused) {
        velY = -4; // Встановлюємо від'ємне значення для vertical speed (імпульс)
        fly.play(); // Відтворюємо звук при стрибку
    }
}
// Функція для малювання сонця
function drawSun() {
    context.beginPath();
    context.arc(200, 100, 40, 0, Math.PI * 2);
    context.fillStyle = "yellow";
    context.fill();
}
// Функція для отримання випадкової висоти труби
function getRandomPipeHeight() {
    let minHeight = 50;
    let maxHeight = canvas.height - gap - road.height - 50;
    return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
}
// Функція для малювання всіх елементів
function draw() {
    if (isPaused) return; // Якщо гра на паузі, не оновлюємо кадр
    if (back.complete && bird.complete && pipeBottom.complete && pipeUp.complete && road.complete) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(back, 0, 0);
        // Малюємо дорогу
        context.drawImage(road, 0, canvas.height - road.height);
        context.drawImage(bird, xPos, yPos);
        // Малюємо сонце
        drawSun();
        // Гравітація і рух пташки
        velY += gravity;
        yPos += velY;
        // Перевірка на зіткнення з нижньою частиною канвасу
        if (yPos >= canvas.height - bird.height - road.height) {
            yPos = canvas.height - bird.height - road.height;
            velY = 0;
        }
        // Перевірка на зіткнення з верхньою частиною канвасу
        if (yPos <= 0) {
            yPos = 0;
            velY = 0;
        }
        // Малювання і оновлення труб
        for (let i = 0; i < pipes.length; i++) {
            let pipeCurrent = pipes[i];
            // Малювання верхньої труби
            context.drawImage(pipeUp, pipeCurrent.x, pipeCurrent.y - pipeUp.height);
            // Малювання нижньої труби
            context.drawImage(pipeBottom, pipeCurrent.x, pipeCurrent.y + gap);
            pipeCurrent.x--;
            // Перевірка нарахування рахунку
            if (pipeCurrent.x === xPos - pipeUp.width / 2) {
                score++;
                scoreAudio.play();
                document.getElementById('score').textContent = score;
                updateBestScore();
            }
            if (pipeCurrent.x == -pipeUp.width) {
                pipeCurrent.x = canvas.width;
                pipeCurrent.y = getRandomPipeHeight();
            }
            // Перевірка на зіткнення з трубами
            if (
                xPos + bird.width - 5 > pipeCurrent.x &&
                xPos < pipeCurrent.x + pipeUp.width &&
                (yPos < pipeCurrent.y || yPos + bird.height > pipeCurrent.y + gap)
            ) {
                showCollisionEffect(xPos, yPos);
                reload();
                break;
            }
        }
    }
    animationID = requestAnimationFrame(draw);
}
// Функція для оновлення найкращого рахунку
function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('best-score').textContent = bestScore;
    }
}
// Функція для показу ефекту зіткнення
function showCollisionEffect(x, y) {
    const collisionEffect = document.getElementById('collision-effect');
    collisionEffect.style.left = `${x}px`;
    collisionEffect.style.top = `${y}px`;
    collisionEffect.style.animation = 'explode 0.5s linear';
    setTimeout(() => {
        collisionEffect.style.animation = 'none';
    }, 500);
}
// Функція для паузи/відновлення гри
function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        draw();
    } else {
        cancelAnimationFrame(animationID); // Зупиняємо анімацію
    }
}
// Додавання обробника події для натискання клавіші 'F' для паузи
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'f') { // Перевірка на натискання клавіші 'F' (регістронезалежно)
        togglePause();
    } else if (event.code === 'Space' && !isPaused) {
        moveUp();
    }
});
// Початковий виклик для анімації
draw();
// Додавання обробника події для натискання миші
canvas.addEventListener('mousedown', moveUp);
function reload() {
    xPos = 10;
    yPos = 150;
    velY = 0;
    pipes = [];
    score = 0;
    document.getElementById('score').textContent = score;
    pipes[0] = {
        x: canvas.width,
        y: getRandomPipeHeight()
    };
}