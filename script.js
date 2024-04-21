const PIXELSIZE = 15;
const GAMEWIDTH = 900;
const GAMEHEIGHT = 600;
const convert = {
  x: (x) => x * PIXELSIZE,
  y: (y) => y * PIXELSIZE,
};

const canvas = document.querySelector("#game-grid");
canvas.setAttribute("height", GAMEHEIGHT);
canvas.setAttribute("width", GAMEWIDTH);
const { width, height } = canvas.getBoundingClientRect();

class Game {
  constructor(width, height) {
    this.grid = this.makeInitialGrid(width, height);
    this.ctx = canvas.getContext("2d");
  }
  //   GRID FUNCS
  makeInitialGrid(width, height) {
    const rows = new Array(width / PIXELSIZE).fill(0);
    const columns = new Array(height / PIXELSIZE);
    const grid = columns.fill(rows);
    grid[1][1] = 1;
    grid[2][1] = 1;
    grid[3][1] = 1;
    console.log(grid);
    return grid;
  }

  getSelf(x, y) {
    return this.grid[x][y];
  }

  mapGrid(func) {
    return this.grid.map((row, rowIndex) =>
      row.map((col, colIndex) => func(rowIndex, colIndex))
    );
  }

  getSiblings(x, y) {
    const siblings = [
      [x - 1, y - 1],
      [x, y - 1],
      [x + 1, y - 1],
      [x - 1, y],
      [x + 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x + 1, y + 1],
    ].filter((array) => {
      return array.every((number) => {
        return (
          number >= 0 &&
          number < GAMEHEIGHT / PIXELSIZE &&
          number < GAMEWIDTH / PIXELSIZE
        );
      });
    });
    return siblings.flatMap(([x, y]) =>
      this.grid[x][y] === 1 ? this.grid[x][y] === 1 : []
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
    this.grid = this.mapGrid((row, col) => {
      return this.makeNextPixel(row, col);
    });
  }

  //   RENDER
  renderGrid() {
    this.mapGrid((row, col) => {
      const cell = this.grid[row][col];
      cell === 0 ? this.clearCell(row, col) : this.fillCell(row, col);
    });
  }

  fillCell(x, y) {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(convert.x(x), convert.y(y), 15, 15);
  }

  clearCell(x, y) {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(convert.x(x), convert.y(y), 15, 15);
  }

  startGame() {
    setInterval(() => {
      this.renderGrid();
      this.makeNextGrid();
    }, 1000);
  }
}

const game = new Game(width, height);
game.startGame();
