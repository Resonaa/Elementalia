import "./style.css";

import confetti from "canvas-confetti";

import { Board } from "./board";
import { Position } from "./position";
import { Cat } from "./cat";
import { Directions } from "./direction";

const DEPTH = 7;
const INITIAL_OBSTACLES = 4;

const board = new Board(DEPTH);
const cat = new Cat();

let gameActive = true;

const svg = document.querySelector("svg")!;
const message = document.getElementById("message")!;
const resetBtn = document.getElementById("reset")!;
const catElement = document.querySelector("image")!;

updateViewBox();
initEventListeners();
generateHexGrid();
resetGame();

function updateViewBox() {
  const right = new Position(board.depth, 0).pixelize();
  const left = new Position(-board.depth, 0).pixelize();
  const topLeft = new Position(0, -board.depth).pixelize();
  const bottomRight = new Position(0, board.depth).pixelize();
  const x = left.q - 1;
  const y = topLeft.r - 1;
  const w = right.q - x + 1;
  const h = bottomRight.r - y + 1;

  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

function generateHexGrid() {
  for (let q = -board.depth; q <= board.depth; q++) {
    for (let r = -board.depth; r <= board.depth; r++) {
      const pos = new Position(q, r);
      if (!board.checkPos(pos)) {
        continue;
      }

      const { q: cx, r: cy } = pos.pixelize();
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", cx.toString());
      circle.setAttribute("cy", cy.toString());
      circle.setAttribute("r", "0.79");
      circle.dataset.coords = pos.toString();

      svg.prepend(circle);
    }
  }
}

function getCatSize() {
  const size = { width: 0, height: 0 };

  if (cat.dir.includes("top") || cat.dir.includes("bottom")) {
    size.width = 2;
    size.height = 2.8;
  } else {
    size.width = 3.42;
    size.height = 1.8;
  }

  return size;
}

function getCatPos() {
  const { q, r } = cat.pos.pixelize();
  const pos = { x: 0, y: 0 };

  if (cat.dir === "bottom_left") {
    pos.x = q - 1.3;
    pos.y = r - 1.3;
  } else if (cat.dir === "bottom_right") {
    pos.x = q - 0.7;
    pos.y = r - 1.3;
  } else if (cat.dir === "left") {
    pos.x = q - 2.5;
    pos.y = r - 1.3;
  } else if (cat.dir === "right") {
    pos.x = q - 1.0;
    pos.y = r - 1.3;
  } else if (cat.dir === "top_left") {
    pos.x = q - 1.3;
    pos.y = r - 2.3;
  } else if (cat.dir === "top_right") {
    pos.x = q - 0.7;
    pos.y = r - 2.3;
  }

  return pos;
}

function placeCat() {
  for (const [key, value] of Object.entries({
    href: getCatHref(),
    ...getCatPos(),
    ...getCatSize(),
  })) {
    catElement.setAttribute(key, value.toString());
  }
}

function getCatHref() {
  return new URL(`/static/${cat.dir}.svg`, import.meta.url).href;
}

function animateCatMove(dir: keyof typeof Directions) {
  cat.dir = dir;
  cat.pos = cat.pos.add(Directions[dir]);
  placeCat();
}

function animateCatEscape() {
  for (let i = 0; i < 10; i++) {
    animateCatMove(cat.dir);
  }
}

function handleClick(e: PointerEvent) {
  if (!gameActive) {
    return resetGame();
  }

  const circle = e.target as SVGCircleElement;
  if (!circle || !circle.dataset.coords) {
    return;
  }

  const pos = Position.fromString(circle.dataset.coords);
  message.textContent = `您点击了 (${pos.r}, ${pos.q})`;

  if (board.isObstacle(pos) || cat.pos.eq(pos)) {
    return;
  }

  circle.classList.add("obstacle");
  board.setObstacle(pos);

  if (board.ifPlayerWins(cat.pos)) {
    message.textContent = "您赢了！";
    gameActive = false;
    confetti({
      particleCount: 100,
      spread: 70,
      disableForReducedMotion: true,
    });
    return;
  }

  animateCatMove(cat.step(board)!);

  if (board.ifCatWins(cat.pos)) {
    message.textContent = "小猫逃走了！";
    gameActive = false;
    animateCatEscape();
  }
}

function resetGame() {
  cat.reset();
  board.reset(INITIAL_OBSTACLES);

  message.textContent = "点击小圆点，围住小猫";

  for (const circle of document.querySelectorAll("circle")) {
    const pos = Position.fromString(circle.dataset.coords!);
    if (board.isObstacle(pos)) {
      circle.classList.add("obstacle");
    } else {
      circle.classList.remove("obstacle");
    }
  }

  placeCat();
  gameActive = true;
}

function initEventListeners() {
  svg.addEventListener("pointerdown", handleClick);
  resetBtn.addEventListener("pointerdown", resetGame);
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });
}
