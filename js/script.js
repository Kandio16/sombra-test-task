const gameContainer = document.getElementById("game-container");
const timerContainer = document.getElementById("timer");
const resultContainer = document.getElementById("result");

class MatchGrid {
  constructor({ width, height, columns, rows, timeLimit, theme }) {
    this.width = width;
    this.height = height;
    this.columns = columns;
    this.rows = rows;
    this.timeLimit = timeLimit;
    this.theme = theme;

    this.cards = [];
    this.selectedCards = [];
    this.matchedPairs = 0;
    this.timer = null;
    this.timeLeft = timeLimit;
    this.playing = false;
    this.isPaused = false;

    this.createGame();
    this.attachEventListeners();
  }

  startGame() {
    clearInterval(this.timer);
    gameContainer.innerHTML = "";
    resultContainer.innerText = "";
    resultContainer.classList.remove("success", "failed");

    this.cards = [];
    this.selectedCards = [];
    this.matchedPairs = 0;
    this.timer = null;
    this.timeLeft = this.timeLimit;
    this.playing = false;
    this.isPaused = false;

    this.createGame();
    this.attachEventListeners();
    this.setupGameTimer();
  }

  createGame() {
    this.setupGameContainer();

    const pairs = this.generateCardPairs();

    this.shuffleCards(pairs);

    this.createCardElements(pairs);
  }

  setupGameContainer() {
    gameContainer.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
    gameContainer.style.width = `${this.width}px`;
    gameContainer.style.height = `${this.height}px`;
  }

  generateCardPairs() {
    const pairs = [];

    for (let i = 1; i <= (this.rows * this.columns) / 2; i++) {
      pairs.push(i, i);
    }

    return pairs;
  }

  shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];
    }
  }

  createCardElements(pairs) {
    for (let i = 0; i < this.rows * this.columns; i++) {
      const card = this.createCardElement(pairs[i]);
      this.cards.push(card);
    }
  }

  createCardElement(value) {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");
    cardContent.innerText = value;

    card.appendChild(cardContent);

    card.dataset.id = value;
    card.addEventListener("click", () => this.handleCardClick(card));
    gameContainer.appendChild(card);

    const currentTheme = themeStyles[this.theme] || themeStyles.light;
    card.style.backgroundColor = currentTheme.bgCardColor;
    card.style.color = currentTheme.cardColor;
    card.style.fontSize = `${currentTheme.fontSize}px`;
    card.style.fontStyle = currentTheme.fontStyle;
    card.style.fontWeight = currentTheme.fontWeight;

    return card;
  }

  setupGameTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateTimer();

        if (this.timeLeft <= 0 && this.matchedPairs < this.cards.length / 2) {
          this.endGame("Time's up! You lose.", "failed");
        }
      }
    }, 1000);
  }

  attachEventListeners() {
    document.getElementById("replay-button").addEventListener("click", () => {
      this.startGame();
    });

    if (!this.isGameEnded) {
      gameContainer.addEventListener("mouseleave", () =>
        this.handleMouseLeave()
      );
      gameContainer.addEventListener("mouseenter", () =>
        this.handleMouseEnter()
      );
    }
  }

  handleMouseLeave() {
    if (!this.isPaused) {
      this.isPaused = true;
      timerContainer.classList.remove("success");
      clearInterval(this.timer);
    }
  }

  handleMouseEnter() {
    if (this.isPaused) {
      timerContainer.classList.add("success");
      this.isPaused = false;
      this.setupGameTimer();
    }
  }

  handleCardClick(card) {
    if (
      card.classList.contains("open") ||
      this.selectedCards.length === 2 ||
      this.playing
    ) {
      return;
    }

    this.playing = true;

    this.flipCardAnimation(card);

    if (this.selectedCards.length < 2) {
      this.selectedCards.push(card);

      if (this.selectedCards.length === 2) {
        this.checkMatch();
      }
    }

    setTimeout(() => {
      this.playing = false;
    }, 1000);
  }

  flipCardAnimation(card) {
    anime({
      targets: card,
      rotateY: { value: 180, delay: 200 },
      easing: "easeInOutSine",
      duration: 400,
      complete: () => {
        card.classList.add("open");

        anime({
          targets: card.querySelector(".card-content"),
          rotateY: 180,
          easing: "easeInOutSine",
          duration: 0,
        });
      },
    });
  }

  checkMatch() {
    const [card1, card2] = this.selectedCards;
    const id1 = card1.dataset.id;
    const id2 = card2.dataset.id;

    if (id1 === id2) {
      this.matchedPairs++;

      setTimeout(() => {
        this.hideMatchedCards(card1, card2);
        this.selectedCards = [];
      }, 1000);
    } else {
      setTimeout(() => {
        card1.classList.remove("open");
        card2.classList.remove("open");
        this.closeMismatchedCards(card1, card2);
        this.selectedCards = [];
      }, 1000);
    }

    if (this.matchedPairs === this.cards.length / 2) {
      setTimeout(
        () => this.endGame("Congratulations! You won!", "success"),
        1000
      );
    }
  }

  hideMatchedCards(card1, card2) {
    card1.classList.add("hidden");
    card2.classList.add("hidden");
  }

  closeMismatchedCards(card1, card2) {
    anime({
      targets: [card1, card2],
      rotateY: 0,
      easing: "easeInOutQuad",
      duration: 400,
    });
  }

  pauseGame() {
    clearInterval(this.timer);
  }

  endGame(message, msgClass) {
    gameContainer.innerHTML = "";
    resultContainer.classList.add(msgClass);
    resultContainer.innerText = message;
    clearInterval(this.timer);
  }

  updateTimer() {
    timerContainer.classList.add("success");
    timerContainer.innerText = `Timer: ${this.timeLeft}s`;
  }

  get isGameEnded() {
    return this.matchedPairs === this.cards.length / 2;
  }
}

function init() {
  const game = new MatchGrid({
    width: 800,
    height: 600,
    columns: 4,
    rows: 4,
    timeLimit: 40,
    theme: "dark",
  });

  game.startGame();
}

window.onload = init;

const themeStyles = {
  light: {
    cardColor: "#2500fa",
    bgCardColor: "lightblue",
    fontSize: 40,
    fontStyle: "italic",
    fontWeight: 600,
  },
  dark: {
    cardColor: "white",
    bgCardColor: "black",
    fontSize: 48,
    fontStyle: "normal",
    fontWeight: 600,
  },
};
