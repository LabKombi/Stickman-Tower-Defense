const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const lanes = [
  canvas.height * 0.2,
  canvas.height * 0.4,
  canvas.height * 0.6,
  canvas.height * 0.8,
];
let playerHP = 100;
let enemyHP = 100;

const playerStickmen = [];
const enemyStickmen = [];
const stickmanTypes = {
  archer: { image: "assets/archer.gif", speed: 1, damage: 5, range: 200 },
  swordsman: { image: "assets/swordsman.gif", speed: 2, damage: 10, range: 30 },
  pistolman: { image: "assets/pistolman.gif", speed: 3, damage: 7, range: 100 },
};

// Load Images
const towerPlayer = new Image();
towerPlayer.src = "assets/tower_player.png";

const towerEnemy = new Image();
towerEnemy.src = "assets/tower_enemy.png";

// Check collision between two stickmen
function checkCollision(a, b) {
  return Math.abs(a.x - b.x) < 50 && Math.abs(a.y - b.y) < 20;
}

// Draw stickman based on its type
function drawStickman(type, x, y) {
  const img = new Image();
  img.src = stickmanTypes[type].image;
  ctx.drawImage(img, x, y - 40, 50, 50);
}

// Draw the player and enemy towers
function drawTower() {
  // Player Tower
  ctx.drawImage(towerPlayer, 20, canvas.height / 2 - 150, 100, 300);

  // Enemy Tower
  ctx.drawImage(
    towerEnemy,
    canvas.width - 120,
    canvas.height / 2 - 150,
    100,
    300
  );
}

// Spawn random enemy stickman
function spawnStickman() {
  const lane = Math.floor(Math.random() * lanes.length);
  const type = Object.keys(stickmanTypes)[Math.floor(Math.random() * 3)];
  enemyStickmen.push({
    type,
    x: canvas.width - 150,
    y: lanes[lane],
    ...stickmanTypes[type],
  });
}

// Update positions of stickmen and check for collisions
function updateStickmen() {
  playerStickmen.forEach((stickman) => (stickman.x += stickman.speed));
  enemyStickmen.forEach((stickman) => (stickman.x -= stickman.speed));

  // Detect collision between player and enemy stickmen
  for (let i = playerStickmen.length - 1; i >= 0; i--) {
    for (let j = enemyStickmen.length - 1; j >= 0; j--) {
      if (checkCollision(playerStickmen[i], enemyStickmen[j])) {
        playerStickmen.splice(i, 1); // Remove player stickman
        enemyStickmen.splice(j, 1); // Remove enemy stickman
        break;
      }
    }
  }

  // Detect stickmen reaching the enemy tower
  playerStickmen.forEach((stickman, index) => {
    if (stickman.x >= canvas.width - 150) {
      enemyHP -= stickman.damage;
      playerStickmen.splice(index, 1); // Remove stickman after damage
    }
  });

  enemyStickmen.forEach((stickman, index) => {
    if (stickman.x <= 120) {
      playerHP -= stickman.damage;
      enemyStickmen.splice(index, 1); // Remove stickman after damage
    }
  });
}

// Draw the game elements (stickmen, towers, health bars)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Towers
  drawTower();

  // Draw Stickmen
  playerStickmen.forEach((stickman) =>
    drawStickman(stickman.type, stickman.x, stickman.y)
  );
  enemyStickmen.forEach((stickman) =>
    drawStickman(stickman.type, stickman.x, stickman.y)
  );

  // Draw HP Bars
  ctx.fillStyle = "blue";
  ctx.fillRect(20, 20, playerHP, 20);
  ctx.fillStyle = "red";
  ctx.fillRect(canvas.width - 120, 20, enemyHP, 20);

  // Check for Game Over
  if (playerHP <= 0) {
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.fillText(
      "Game Over! Enemy Wins",
      canvas.width / 2 - 200,
      canvas.height / 2
    );
    return;
  }

  if (enemyHP <= 0) {
    ctx.fillStyle = "green";
    ctx.font = "50px Arial";
    ctx.fillText("Victory! You Win", canvas.width / 2 - 200, canvas.height / 2);
    return;
  }
}

// Main game loop
function gameLoop() {
  if (playerHP <= 0 || enemyHP <= 0) return; // Stop the game if HP is 0
  updateStickmen();
  draw();
  requestAnimationFrame(gameLoop);
}

// Event listener to deploy stickman
canvas.addEventListener("click", (e) => {
  const laneIndex = Math.floor(e.clientY / (canvas.height / lanes.length));
  const type = Object.keys(stickmanTypes)[Math.floor(Math.random() * 3)];
  playerStickmen.push({
    type,
    x: 100,
    y: lanes[laneIndex],
    ...stickmanTypes[type],
  });
});

// Spawn enemies at intervals
setInterval(spawnStickman, 3000);

// Start the game loop
gameLoop();
