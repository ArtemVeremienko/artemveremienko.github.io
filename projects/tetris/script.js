const main = document.querySelector('.main');
const scoreElem = document.getElementById('score');
const levelElem = document.getElementById('level');
const nextTetroElem = document.getElementById('nextTetro');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const gameOver = document.querySelector('.game-over');
const gameOverScore = gameOver.querySelector('.game-over__score');
const gameOverClose = gameOver.querySelector('.game-over__close');

let playfield = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const figures = {
  O: [
    [1, 1],
    [1, 1]
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [1, 1, 1],
    [1, 0, 0],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0]
  ]
}


let activeTetro = getNewTetro();
let nextTetro = getNewTetro();

let score = 0;
let currenLevel = 1;

let isPaused = true;
let isReset = false;
let gameTimerID;

let possibleLevels = {
  1: {
    scorePerLine: 10,
    speed: 400,
    nextLevelScore: 100
  },
  2: {
    scorePerLine: 15,
    speed: 300,
    nextLevelScore: 200
  },
  3: {
    scorePerLine: 20,
    speed: 200,
    nextLevelScore: 400
  },
  4: {
    scorePerLine: 30,
    speed: 100,
    nextLevelScore: 800
  },
  5: {
    scorePerLine: 50,
    speed: 50,
    nextLevelScore: Infinity
  },
}

function draw() {
  let mainInnerHTML = '';

  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playfield[y][x] === 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }

    }
  }

  main.innerHTML = mainInnerHTML;
}

function drwaNextTetro() {
  let nextTetroInnerHTML = "";

  for (let y = 0; y < nextTetro.shape.length; y++) {
    for (let x = 0; x < nextTetro.shape[y].length; x++) {
      if (nextTetro.shape[y][x]) {
        nextTetroInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextTetroInnerHTML += '<div class="cell"></div>';
      }
    }
    nextTetroInnerHTML += '<br/>';
  }

  nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removePrevActiveTetro() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) playfield[y][x] = 0;
    }
  }
}

function addActiveTetro() {
  removePrevActiveTetro();
  for (let y = 0; y < activeTetro.shape.length; y++) {
    for (let x = 0; x < activeTetro.shape[y].length; x++) {
      if (activeTetro.shape[y][x] === 1) {
        playfield[activeTetro.y + y][activeTetro.x + x] = activeTetro.shape[y][x];
      }
    }
  }
}

function rotateTetro() {
  const prevTetroState = activeTetro.shape;
  activeTetro.shape = activeTetro.shape[0].map((val, index) => activeTetro.shape.map(row => row[index]).reverse());

  if (hasCollisions()) {
    activeTetro.shape = prevTetroState;
  }
}

function hasCollisions() {
  for (let y = 0; y < activeTetro.shape.length; y++) {
    for (let x = 0; x < activeTetro.shape[y].length; x++) {
      if (
        activeTetro.shape[y][x] &&
        (playfield[activeTetro.y + y] === undefined ||
          playfield[activeTetro.y + y][activeTetro.x + x] === undefined ||
          playfield[activeTetro.y + y][activeTetro.x + x] === 2)
      ) {
        return true;
      }
    }
  }
  return false;
}

// проверяем заполненые линии
function removeFullLines() {
  let addScore = possibleLevels[currenLevel].scorePerLine
  let filledLines = 0;

  for (let y = 0; y < playfield.length; y++) {
    let canRemove = true;

    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] !== 2) {
        canRemove = false;
        break;
      }
    }

    if (canRemove) {
      playfield.splice(y, 1);
      playfield.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      filledLines++;
    }
  }

  switch (filledLines) {
    case 1:
      score += addScore;
      break;
    case 2:
      score += addScore * 3;
      break;
    case 3:
      score += addScore * 6;
      break;
    case 4:
      score += addScore * 12;
      break;
  }

  scoreElem.textContent = score;
  if (score >= possibleLevels[currenLevel].nextLevelScore) {
    currenLevel++;
    levelElem.textContent = currenLevel;
  }

}

// получает новую случаюную фигуру из figures
function getNewTetro() {
  const possibleFigures = 'IOLJTSZ';
  const rand = Math.floor(Math.random() * possibleFigures.length);
  const newTetro = figures[possibleFigures[rand]];
  return {
    x: Math.floor((playfield[0].length - newTetro[0].length) / 2),
    y: 0,
    shape: newTetro
  };
}

// фиксируем фигурку
function fixTetro() {
  for (let y = 0; y < playfield.length; y++) {
    for (let x = 0; x < playfield[y].length; x++) {
      if (playfield[y][x] === 1) {
        playfield[y][x] = 2;
      }
    }
  }

}

// двигает фигурку вниз
function moveTetroDown() {
  if (isPaused) return;
  activeTetro.y++;
  if (hasCollisions()) {
    activeTetro.y--;
    fixTetro();
    removeFullLines();
    activeTetro = nextTetro;
    if (hasCollisions()) {
      reset();
    }
    nextTetro = getNewTetro();
  }
}

function reset() {
  gameOver.style.transform = 'scale(1)';
  gameOverScore.textContent = score;

  isPaused = true;
  clearTimeout(gameTimerID);
  playfield = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];
  score = 0;
  currenLevel = 1;
  scoreElem.textContent = score;
  levelElem.textContent = currenLevel;
  nextTetroElem.innerHTML = "";
  draw();
}

function dropTetro() {
  for (let y = activeTetro.y; y < playfield.length; y++) {
    activeTetro.y++;
    if (hasCollisions()) {
      activeTetro.y--;
      break;
    }
  }
}

document.addEventListener('keydown', e => {
  if (isPaused) return;

  if (e.keyCode === 37) {
    // Двигаем фигурку влево при нажатии влево
    activeTetro.x--;
    if (hasCollisions()) {
      activeTetro.x++;
    }
  } else if (e.keyCode === 39) {
    // Двигаем фигурку вправо при нажатии вправо
    activeTetro.x++;
    if (hasCollisions()) {
      activeTetro.x--;
    }
  } else if (e.keyCode === 40) {
    // Ускоряем фигурку при нажатии вниз
    moveTetroDown();
  } else if (e.keyCode === 38) {
    // Вращаем фигуру при нажатии вверх
    rotateTetro();
  } else if (e.keyCode === 32) {
    // При нажатии пробела фигурка падает вниз
    dropTetro();
  }

  updateGameState();
});

function updateGameState() {
  if (isPaused) return;
  addActiveTetro();
  draw();
  drwaNextTetro();
}

pauseBtn.addEventListener('click', (e) => {
  const target = e.target;

  if (target.textContent === 'Pause') {
    target.textContent = 'Keep Playing...';
    clearTimeout(gameTimerID);
  } else {
    target.textContent = 'Pause';
    gameTimerID = setTimeout(startGame, possibleLevels[currenLevel].speed)
  }

  isPaused = !isPaused;

  pauseBtn.blur();
});

startBtn.addEventListener('click', () => {
  if (!isPaused) return;
  isPaused = false;
  gameTimerID = setTimeout(startGame, possibleLevels[currenLevel].speed);
  startBtn.textContent = 'Start again';
  startBtn.blur();
});

gameOverClose.addEventListener('click', () => {
  gameOver.style.transform = '';
})

scoreElem.textContent = score;
levelElem.textContent = currenLevel;


draw();


function startGame() {
  moveTetroDown();
  if (!isPaused) {
    updateGameState();
    gameTimerID = setTimeout(startGame, possibleLevels[currenLevel].speed)
  }

}