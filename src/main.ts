import "./style.css";

import "@fontsource-variable/noto-sans-sc";

import { preload } from "./preload";

import { Board } from "./board";
import { Position } from "./position";
import { Cat } from "./cat";
import { Directions } from "./direction";

const DEPTH = 7;

const board = new Board(DEPTH);
const cat = new Cat();
let gameActive = true;
let canClick = true;

let animationResolve: undefined | ((value: boolean) => void);

const svg = document.querySelector("svg") as HTMLOrSVGElement as SVGElement;
const message = document.getElementById("message") as HTMLDivElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const catElement = document.querySelector(
  "image",
) as HTMLOrSVGImageElement as SVGImageElement;

updateViewBox();
initEventListeners();
generateHexGrid();
resetGame();

preload();

function updateViewBox() {
  const right = new Position(DEPTH, 0).pixelize();
  const left = new Position(-DEPTH, 0).pixelize();
  const topLeft = new Position(0, -DEPTH).pixelize();
  const bottomRight = new Position(0, DEPTH).pixelize();
  const x = left.q - 1;
  const y = topLeft.r - 1;
  const w = right.q - x + 1;
  const h = bottomRight.r - y + 1;

  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

function generateHexGrid() {
  for (let q = -DEPTH; q <= DEPTH; q++) {
    for (let r = -DEPTH; r <= DEPTH; r++) {
      const pos = new Position(q, r);
      if (!board.checkPos(pos)) {
        continue;
      }

      const { q: cx, r: cy } = pos.pixelize();
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", 0.79);
      circle.dataset.coords = pos.toString();

      svg.prepend(circle);
    }
  }
}

function placeCat() {
  const { q, r } = cat.pos.pixelize();
  catElement.setAttribute("href", `/${cat.dir}/${cat.lost ? 2 : 1}.svg`);

  if (cat.dir.includes("top") || cat.dir.includes("bottom")) {
    catElement.setAttribute("width", 2);
    catElement.setAttribute("height", 2.8);
  } else {
    catElement.setAttribute("width", 3.42);
    catElement.setAttribute("height", 1.8);
  }

  if (cat.dir === "bottom_left") {
    catElement.setAttribute("x", q - 1.3);
    catElement.setAttribute("y", r - 1.3);
  }

  if (cat.dir === "bottom_right") {
    catElement.setAttribute("x", q - 0.7);
    catElement.setAttribute("y", r - 1.3);
  }

  if (cat.dir === "left") {
    catElement.setAttribute("x", q - 2.5);
    catElement.setAttribute("y", r - 1.3);
  }

  if (cat.dir === "right") {
    catElement.setAttribute("x", q - 1.0);
    catElement.setAttribute("y", r - 1.3);
  }

  if (cat.dir === "top_left") {
    catElement.setAttribute("x", q - 1.3);
    catElement.setAttribute("y", r - 2.3);
  }

  if (cat.dir === "top_right") {
    catElement.setAttribute("x", q - 0.7);
    catElement.setAttribute("y", r - 2.3);
  }
}

async function animateCatMove(move: Position, escaped = false) {
  placeCat();

  let shouldContinue = true;

  for (let frame = 3; frame <= 5; frame++) {
    catElement.setAttribute("href", `/${cat.dir}/${frame}.svg`);
    if (
      !(await new Promise((resolve) => {
        animationResolve = resolve;
        setTimeout(() => resolve(true), 75);
      }))
    ) {
      shouldContinue = false;
      break;
    }
  }

  if (escaped && !shouldContinue) {
    return false;
  }

  cat.pos = cat.pos.add(move);
  placeCat();

  return shouldContinue;
}

async function animateCatEscape() {
  while (true) {
    if (!(await animateCatMove(Directions[cat.dir], true))) {
      cat.pos.set(0, 0);
      return;
    }
  }
}

function handleClick(e: MouseEvent) {
  if (!canClick) {
    return;
  }

  animationResolve && animationResolve(false);

  if (!gameActive) {
    canClick = false;
    return resetGame();
  }

  const circle = e.target as SVGCircleElement;
  if (!circle || !circle.dataset.coords) {
    return;
  }

  const pos = Position.fromString(circle.dataset.coords);
  message.textContent = `您点击了 (${pos.r}, ${pos.q})`;

  if (board.isObstacle(pos)) {
    return;
  }

  circle.classList.add("obstacle");
  board.obstacles.add(pos.toString());

  canClick = false;

  if (board.ifPlayerWins(cat.pos)) {
    message.textContent = "您赢了！";
    gameActive = false;
    cat.lost = true;
    placeCat();
    canClick = true;
    return;
  }

  const nextMove = cat.step(board);
  animateCatMove(nextMove).then(() => {
    if (board.ifCatWins(cat.pos)) {
      message.textContent = "您放生了一只小猫！";
      gameActive = false;
      animateCatEscape();
    }
    canClick = true;
  });
}

function resetGame() {
  canClick = false;
  animationResolve && animationResolve(false);
  cat.reset();
  board.reset(4);
  message.textContent = "点击小圆点，围住小猫";
  for (const circle of document.querySelectorAll("circle")) {
    const pos = Position.fromString(circle.dataset.coords);
    if (board.isObstacle(pos)) {
      circle.classList.add("obstacle");
    } else {
      circle.classList.remove("obstacle");
    }
  }
  placeCat();
  requestAnimationFrame(() => (canClick = gameActive = true));
}

function initEventListeners() {
  svg.addEventListener("click", handleClick);
  resetBtn.addEventListener("click", resetGame);
}
