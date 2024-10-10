const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройки игры
const tileSize = 50; // Размер одной клетки
const playerSize = 40; // Размер игрока
const playerSpeed = 50; // Скорость перемещения

// Позиция игрока
let player = {
  x: 1 * tileSize,
  y: 1 * tileSize
};

// Текущий уровень
let currentLevel = 0;
let score = 0; // Счёт

// Определение уровней
const levels = [
  {
    maze: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 3, 0, 1, 0, 0, 0, 0, 1], // '3' - монетка
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 2, 1], // '2' - выход
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 3, 1, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { x: 1 * tileSize, y: 1 * tileSize }
  },
  {
    maze: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 3, 1, 2, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 3, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { x: 1 * tileSize, y: 1 * tileSize }
  },
  {
    maze: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 3, 0, 0, 1, 0, 1], // '3' - монетка
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 2, 1],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 1, 3, 1], // '3' - монетка
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { x: 1 * tileSize, y: 1 * tileSize }
  }
];

// Функция рисования лабиринта
function drawMaze() {
  const maze = levels[currentLevel].maze;
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col] === 1) {
        ctx.fillStyle = 'black'; // Стены
      } else if (maze[row][col] === 2) {
        ctx.fillStyle = 'green'; // Выход
      } else if (maze[row][col] === 3) {
        ctx.fillStyle = 'yellow'; // Монетка
      } else {
        ctx.fillStyle = 'white'; // Пустые клетки
      }
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

// Функция рисования игрока
function drawPlayer() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x + 5, player.y + 5, playerSize, playerSize);
}

// Функция отображения очков
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 520, 50); // Смещаем счётчик вправо
}

// Обработчик нажатий клавиш
document.addEventListener('keydown', function(event) {
  let newX = player.x;
  let newY = player.y;

  if (event.key === 'ArrowUp') {
    newY -= playerSpeed;
  } else if (event.key === 'ArrowDown') {
    newY += playerSpeed;
  } else if (event.key === 'ArrowLeft') {
    newX -= playerSpeed;
  } else if (event.key === 'ArrowRight') {
    newX += playerSpeed;
  }

  // Проверка на столкновение со стенами
  if (canMoveTo(newX, newY)) {
    player.x = newX;
    player.y = newY;
  }

  // Проверка, достиг ли игрок выхода
  if (checkExit(newX, newY)) {
    nextLevel();
  }

  // Проверка на сбор монетки
  collectCoin(newX, newY);

  // Перерисовка
  drawGame();
});

// Функция проверки, можно ли двигаться на новую клетку
function canMoveTo(newX, newY) {
  const col = newX / tileSize;
  const row = newY / tileSize;
  const maze = levels[currentLevel].maze;
  return maze[row] && (maze[row][col] === 0 || maze[row][col] === 2 || maze[row][col] === 3); // Можно двигаться на пустую клетку, выход или монетку
}

// Функция проверки достижения выхода
function checkExit(newX, newY) {
  const col = newX / tileSize;
  const row = newY / tileSize;
  return levels[currentLevel].maze[row][col] === 2;
}

// Функция перехода на следующий уровень
function nextLevel() {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    player.x = levels[currentLevel].playerStart.x;
    player.y = levels[currentLevel].playerStart.y;
  } else {
    alert('Вы прошли все уровни!');
    currentLevel = 0;
    player.x = levels[currentLevel].playerStart.x;
    player.y = levels[currentLevel].playerStart.y;
    score = 0; // Сбросим очки
  }
}

// Функция сбора монеток
function collectCoin(newX, newY) {
  const col = newX / tileSize;
  const row = newY / tileSize;
  if (levels[currentLevel].maze[row][col] === 3) {
    score += 100;
    levels[currentLevel].maze[row][col] = 0; // Удаляем монетку с карты
  }
}

// Функция рисования всей игры
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка экрана
  drawMaze();
  drawPlayer();
  drawScore();
}

// Начальная отрисовка игры
drawGame();