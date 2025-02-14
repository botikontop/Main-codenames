// Zoom functionality
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");
const container = document.querySelector(".container");

let zoomLevel = 1;

zoomInButton.addEventListener("click", () => {
  zoomLevel += 0.1;
  container.style.transform = `scale(${zoomLevel})`;
});

zoomOutButton.addEventListener("click", () => {
  zoomLevel -= 0.1;
  if (zoomLevel < 0.5) zoomLevel = 0.5;
  container.style.transform = `scale(${zoomLevel})`;
});

// Word grid (5x5)
let words = [];
let teamAssignments = [];

// Game state
let revealedCells = [];
let currentTeam;
let timer;
let timeLeft = 30;
let isFirstClick = true;
let redScore = 0;
let blueScore = 0;

// Word-to-image mapping
const wordImages = {
  "ვაშლი": "apple.jpg",
  "მდინარე": "river.jpg",
  "მთვარე": "moon.jpg",
  "ხმალი": "sword.jpg",
  "ღრუბელი": "cloud.jpg",
  "ვეფხვი": "tiger.jpg",
  "ფურცელი": "paper.jpg",
  "რაინდი": "knight.jpg",
  "პლანეტა": "planet.jpg",
  "ჭიქა": "glass.jpg",
  "თაფლი": "honey.jpg",
  "სასახლე": "castle.jpg",
  "ზვიგენი": "shark.jpg",
  "ტყე": "forest.jpg",
  "ხიდი": "bridge.jpg",
  "ლომი": "lion.jpg",
  "ოკეანე": "ocean.jpg",
  "ფოთოლი": "flower.jpg",
  "უდაბნო": "desert.jpg",
  "რობოტი": "robot.jpg",
  "არწივი": "eagle.jpg",
  "ქვა": "stone.jpg",
  "დრაკონი": "dragon.jpg",
  "მთა": "mountain.jpg",
  "მზე": "sun.jpg"
};

// Shuffle the board and assign teams dynamically
function shuffleBoard() {
  words.length = 0;
  teamAssignments.length = 0;

  const totalWords = 25;
  const redWords = 8;
  const blueWords = 8;
  const neutralWords = 8;
  const assassinWords = 1;

  const assignments = [
    ...Array(redWords).fill("R"),
    ...Array(blueWords).fill("B"),
    ...Array(neutralWords).fill("N"),
    ...Array(assassinWords).fill("A")
  ];

  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }

  const wordPool = [
    "ვაშლი", "მდინარე", "მთვარე", "ხმალი", "ღრუბელი",
    "ვეფხვი", "ფურცელი", "რაინდი", "პლანეტა", "ჭიქა",
    "თაფლი", "სასახლე", "ზვიგენი", "ტყე", "ხიდი",
    "ლომი", "ოკეანე", "ფოთოლი", "უდაბნო", "რობოტი",
    "არწივი", "ქვა", "დრაკონი", "მთა", "მზე"
  ];

  for (let i = wordPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordPool[i], wordPool[j]] = [wordPool[j], wordPool[i]];
  }

  for (let i = 0; i < totalWords; i++) {
    words.push(wordPool[i]);
    teamAssignments.push(assignments[i]);
  }
}

// Create the grid with images and overlays
const board = document.getElementById("board");
function createBoard() {
  board.innerHTML = "";
  words.forEach((word, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    
    const img = document.createElement("img");
    img.src = wordImages[word];
    img.alt = word;
    img.classList.add("card-image");
    card.appendChild(img);

    const overlay = document.createElement("div");
    overlay.classList.add("reveal-overlay");
    const teamClass = teamAssignments[index] === 'R' ? 'Red' :
                     teamAssignments[index] === 'B' ? 'Blue' :
                     teamAssignments[index] === 'N' ? 'Neutral' : 'Assassin';
    overlay.classList.add(teamClass);

    const wordText = document.createElement("div");
    wordText.classList.add("word-text");
    wordText.textContent = word;
    overlay.appendChild(wordText);

    card.appendChild(overlay);
    card.addEventListener("click", () => revealCell(index, card));
    board.appendChild(card);
  });
}

// Update current team display
const currentTeamDisplay = document.getElementById("current-team");
function updateTeamDisplay() {
  currentTeamDisplay.textContent = currentTeam === "R" ? "წითლების ჯერია" : "ლურჯების ჯერია";
  currentTeamDisplay.className = currentTeam === "R" ? "Red-team" : "Blue-team";
}

// Start the timer
function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  const timerDisplay = document.getElementById("timer");
  timerDisplay.textContent = `დარჩენილი დრო: ${timeLeft}წმ`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `დარჩენილი დრო: ${timeLeft}წმ`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      switchTeam();
    }
  }, 1000);
}

// Reveal cell on click
function revealCell(index, card) {
  if (revealedCells.includes(index)) return;

  if (isFirstClick) {
    startTimer();
    isFirstClick = false;
  }

  const team = teamAssignments[index];
  revealedCells.push(index);
  card.classList.add("revealed");
  card.classList.add(team === "R" ? "Red" : team === "B" ? "Blue" : team === "N" ? "Neutral" : "Assassin");

  if (team === "A") {
    endGame(`Assassin! ${currentTeam === "R" ? "წითელმა" : "ლურჯმა"} წააგო!`);
  } else if (team === "N") {
    switchTeam();
  } else if (team !== currentTeam) {
    endGame(`${currentTeam === "R" ? "წითელმა" : "ლურჯმა"} აირჩია სხვა ფერი და წააგო!`);
  } else {
    updateScore(team);
  }

  checkWin();
}

// Update score
function updateScore(team) {
  if (team === "R") {
    redScore++;
    document.getElementById("red-score").textContent = redScore;
  } else if (team === "B") {
    blueScore++;
    document.getElementById("blue-score").textContent = blueScore;
  }
}

// Switch teams
function switchTeam() {
  currentTeam = currentTeam === "R" ? "B" : "R";
  updateTeamDisplay();
  startTimer();
}

// Initialize the game
function initializeGame() {
  revealedCells = [];
  isFirstClick = true;
  redScore = 0;
  blueScore = 0;
  clearInterval(timer);

  document.getElementById("red-score").textContent = "0";
  document.getElementById("blue-score").textContent = "0";
  document.getElementById("message").textContent = "";
  document.getElementById("timer").textContent = "დარჩენილი დრო: 30წმ";

  shuffleBoard();
  createBoard();

  currentTeam = Math.random() < 0.5 ? "R" : "B";
  updateTeamDisplay();

  document.querySelectorAll(".card").forEach(card => {
    card.classList.remove("Red", "Blue", "Neutral", "Assassin", "revealed");
    card.style.pointerEvents = "auto";
  });
}

// Check for win condition
function checkWin() {
  const redRemaining = teamAssignments.filter((team, index) => team === "R" && !revealedCells.includes(index)).length;
  const blueRemaining = teamAssignments.filter((team, index) => team === "B" && !revealedCells.includes(index)).length;

  if (redRemaining === 0) {
    endGame("Red Team Wins!");
    confetti({ particleCount: 200, spread: 70 });
  } else if (blueRemaining === 0) {
    endGame("Blue Team Wins!");
    confetti({ particleCount: 200, spread: 70 });
  }
}

// End the game
function endGame(message) {
  document.getElementById("message").textContent = message;
  document.querySelectorAll(".card").forEach(card => card.style.pointerEvents = "none");
  clearInterval(timer);
}

// Spymaster View Modal
const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `
  <div class="modal-content">
    <h2>Spymaster View</h2>
    <div id="spymaster-list"></div>
    <button class="close-modal">Close</button>
  </div>
`;
document.body.appendChild(modal);

document.getElementById("show-words").addEventListener("click", () => {
  const grouped = {
    red: [],
    blue: [],
    neutral: [],
    assassin: []
  };

  teamAssignments.forEach((team, index) => {
    const item = {word: words[index], team: team};
    if(team === 'R') grouped.red.push(item);
    else if(team === 'B') grouped.blue.push(item);
    else if(team === 'N') grouped.neutral.push(item);
    else if(team === 'A') grouped.assassin.push(item);
  });

  const spymasterList = document.getElementById("spymaster-list");
  spymasterList.innerHTML = `
    <div class="category-section">
      <div class="category-title red">წითელი სიტყვები (${grouped.red.length})</div>
      <ul class="spymaster-list">
        ${grouped.red.map(item => `<li>${item.word} <span class="red">${item.team}</span></li>`).join('')}
      </ul>
    </div>
    
    <div class="category-section">
      <div class="category-title blue">ლურჯი სიტყვები (${grouped.blue.length})</div>
      <ul class="spymaster-list">
        ${grouped.blue.map(item => `<li>${item.word} <span class="blue">${item.team}</span></li>`).join('')}
      </ul>
    </div>

    <div class="category-section">
      <div class="category-title neutral">ნეიტრალური (${grouped.neutral.length})</div>
      <ul class="spymaster-list">
        ${grouped.neutral.map(item => `<li>${item.word} <span class="neutral">N</span></li>`).join('')}
      </ul>
    </div>

    <div class="category-section">
      <div class="category-title assassin">ასასინი (${grouped.assassin.length})</div>
      <ul class="spymaster-list">
        ${grouped.assassin.map(item => `<li>${item.word} <span class="assassin">A</span></li>`).join('')}
      </ul>
    </div>
  `;
  
  modal.style.display = "flex";
});

modal.querySelector(".close-modal").addEventListener("click", () => {
  modal.style.display = "none";
});

// Theme Switcher
document.getElementById("theme-button").addEventListener("click", () => {
  const themeOptions = document.getElementById("theme-options");
  themeOptions.style.display = themeOptions.style.display === "block" ? "none" : "block";
});

document.querySelectorAll("#theme-options button").forEach(button => {
  button.addEventListener("click", () => {
    document.body.className = button.dataset.theme;
    document.getElementById("theme-options").style.display = "none";
  });
});

// Initialize the game
initializeGame();

// New Game Button
document.getElementById("new-game").addEventListener("click", initializeGame);