const CELLSIZE = 10;
const GAMEWIDTH = 1000;
const GAMEHEIGHT = 800;

const isLine = (x1, y1, x2, y2) => {
  console.log({
    clicked: [x1, y1],
    selected: [x2, y2],
  });
  x2 - x1;
  return Math.abs(x2 - x1) > Math.abs(y2 - y1);
};

const canvas = document.querySelector("#game-grid");
canvas.setAttribute("height", GAMEHEIGHT);
canvas.setAttribute("width", GAMEWIDTH);

const { width, height } = canvas.getBoundingClientRect();
class Game {
  constructor(width, height) {
    this.ctx = canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.s = CELLSIZE;
    this.nX = Math.floor(width / this.s) - 2;
    this.nY = Math.floor(height / this.s) - 2;
    this.pX = width - this.nX * this.s;
    this.pY = height - this.nY * this.s;
    this.pL = Math.ceil(this.pX / 2);
    this.pR = Math.ceil(this.pY / 2);
    this.pT = width - this.nX * this.s - this.pL;
    this.pB = height - this.nY * this.s - this.pT;
    this.grid = this.makeInitialGrid(width, height);
    this.convert = {
      x: (x) => x * this.s + this.pL + 1,
      y: (y) => y * this.s + this.pT + 1,
    };
    this.interval = null;
    this.listener = null;
  }

  //   GRID FUNCS
  makeInitialGrid() {
    const rows = new Array(this.nX).fill(0);
    const columns = new Array(this.nY);
    let grid = columns.fill(rows);

    return grid;
  }

  drawGrid() {
    this.ctx.strokeStyle = "lightgrey";
    this.ctx.beginPath();
    for (let x = this.pL; x <= this.width - this.pR; x += this.s) {
      this.ctx.moveTo(x, this.pT);
      this.ctx.lineTo(x, this.height - this.pB);
    }
    for (let y = this.pT; y <= this.height - this.pB; y += this.s) {
      this.ctx.moveTo(this.pL, y);
      this.ctx.lineTo(this.width - this.pR, y);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  getSelf(x, y) {
    return this.grid[y][x];
  }

  mapGrid(func) {
    return this.grid.map((row, rowIndex) =>
      row.map((col, colIndex) => func(colIndex, rowIndex))
    );
  }

  getSiblings(x, y) {
    const siblings = [
      [x - 1, y - 1],
      [x - 1, y],
      [x - 1, y + 1],
      [x, y - 1],
      [x, y + 1],
      [x + 1, y - 1],
      [x + 1, y],
      [x + 1, y + 1],
    ].filter(([x2, y2]) => x2 >= 0 && y2 >= 0 && y2 < this.nY && x2 < this.nX);
    return siblings.flatMap(([x3, y3]) =>
      this.grid[y3][x3] === 1 ? this.grid[y3][x3] : []
    );
  }

  nextState(self, siblings) {
    if (siblings.length === 3) return 1;
    if (siblings.length === 2) return self;
    return 0;
  }

  makeNextPixel(x, y) {
    const self = this.getSelf(x, y);
    const siblings = this.getSiblings(x, y);
    return this.nextState(self, siblings);
  }

  makeNextGrid() {
    this.grid = this.mapGrid((x, y) => {
      return this.makeNextPixel(x, y);
    });
  }

  //   RENDER
  renderGame() {
    this.mapGrid((row, col) => {
      const cell = this.grid[col][row];
      cell === 0 ? this.clearCell(row, col) : this.fillCell(row, col);
    });
    this.ctx.strokeStyle = "transparent";
  }

  fillCell(x, y) {
    this.ctx.fillStyle = "limegreen";
    this.ctx.fillRect(
      this.convert.x(x),
      this.convert.y(y),
      CELLSIZE - 1.85,
      CELLSIZE - 1.85
    );
  }

  hoverCell(x, y) {
    this.ctx.fillStyle = "darkgreen";
    this.ctx.fillRect(
      this.convert.x(x),
      this.convert.y(y),
      CELLSIZE - 1.85,
      CELLSIZE - 1.85
    );
  }

  clearCell(x, y) {
    this.ctx.fillStyle = "#44464d";
    this.ctx.fillRect(
      this.convert.x(x),
      this.convert.y(y),
      CELLSIZE - 1.85,
      CELLSIZE - 1.85
    );
  }

  makeRandomGrid() {
    this.grid = this.grid.map((col, colIndex) =>
      col.map((row, rowIndex) => {
        const random = Math.random();
        return random > 0.5 ? 1 : 0;
      })
    );
  }

  resetGame() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.listener = canvas.addEventListener(
      "click",
      this.onClickCanvas.bind(this)
    );
    canvas.addEventListener("mouseOver", (e) => {
      console.log(e);
    });
  }

  // GAME
  initGame() {
    this.resetGame();
    this.drawGrid();
    this.makeNextGrid();
    this.renderGame();
  }

  startGame() {
    canvas.removeEventListener("click", this.listener);

    if (this.interval) return;
    const interval = setInterval(() => {
      this.renderGame();
      this.makeNextGrid();
    }, 1000 / 30);
    this.interval = interval;
  }

  setCellClicked(arg) {
    this.cellClicked = arg;
  }

  getCellFromClick(e) {
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;
    const gridX = Math.floor(offsetX / this.s) - 1;
    const gridY = Math.floor(offsetY / this.s) - 1;

    return [gridX, gridY];
  }

  // SETUP / INTERACTION

  paintLine(x, y, x2) {
    const init = x > x2 ? x2 : x;
    const compare = x > x2 ? x : x2;
    console.log(init, compare);
    for (let cx = init; cx <= compare; ++cx) {
      console.log(this.grid[y][cx]);
      this.grid[y][cx] = 1;
    }
  }

  paintColumn(y, x, y2) {
    const init = y > y2 ? y2 : y;
    const compare = y < y2 ? y : y2;
    console.log(init, compare);
    for (let cy = init; cy <= compare; ++cy) {
      console.log(cy);
      this.grid[cy][x] = 1;
    }
  }

  onClickCanvas(e) {
    const [clickX, clickY] = this.getCellFromClick(e);
    this.grid[clickY][clickX] = this.grid[clickY][clickX] === 0 ? 1 : 0;
    this.renderGame();
  }
}

const game = new Game(GAMEWIDTH, GAMEHEIGHT);

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => game.startGame());

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  game.makeRandomGrid();
  game.initGame();
});

game.initGame();
