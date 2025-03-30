import "./style.css";

import { Board } from "./board";
import { Position } from "./position";
import { Cat } from "./cat";
import { Directions } from "./direction";
import { preload } from "./preload";

const DEPTH = 7;
const INITIAL_OBSTACLES = 4;

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

let messageText = "点击小圆点，围住小猫";

let catMeta = { x: 0, y: 0, width: 0, height: 0 };

updateViewBox();
initEventListeners();
generateHexGrid();
resetGame();
antiMutation();

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
      circle.setAttribute("cx", cx.toString());
      circle.setAttribute("cy", cy.toString());
      circle.setAttribute("r", "0.79");
      circle.dataset.coords = pos.toString();

      svg.prepend(circle);
    }
  }
}

function placeCat() {
  const { q, r } = cat.pos.pixelize();
  catElement.setAttribute(
    "href",
    new URL(`/static/${cat.dir}/${cat.lost ? 2 : 1}.svg`, import.meta.url).href,
  );

  if (cat.dir.includes("top") || cat.dir.includes("bottom")) {
    catMeta.width = 2;
    catMeta.height = 2.8;
  } else {
    catMeta.width = 3.42;
    catMeta.height = 1.8;
  }

  if (cat.dir === "bottom_left") {
    catMeta.x = q - 1.3;
    catMeta.y = r - 1.3;
  }

  if (cat.dir === "bottom_right") {
    catMeta.x = q - 0.7;
    catMeta.y = r - 1.3;
  }

  if (cat.dir === "left") {
    catMeta.x = q - 2.5;
    catMeta.y = r - 1.3;
  }

  if (cat.dir === "right") {
    catMeta.x = q - 1.0;
    catMeta.y = r - 1.3;
  }

  if (cat.dir === "top_left") {
    catMeta.x = q - 1.3;
    catMeta.y = r - 2.3;
  }

  if (cat.dir === "top_right") {
    catMeta.x = q - 0.7;
    catMeta.y = r - 2.3;
  }

  catElement.setAttribute("width", catMeta.width.toString());
  catElement.setAttribute("height", catMeta.height.toString());
  catElement.setAttribute("x", catMeta.x.toString());
  catElement.setAttribute("y", catMeta.y.toString());
}

async function animateCatMove(move: Position, escaped = false) {
  placeCat();

  let shouldContinue = true;

  for (let frame = 3; frame <= 5; frame++) {
    catElement.setAttribute(
      "href",
      new URL(`/static/${cat.dir}/${frame}.svg`, import.meta.url).href,
    );
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
  messageText = `您点击了 (${pos.r}, ${pos.q})`;
  message.textContent = messageText;

  if (board.isObstacle(pos)) {
    return;
  }

  circle.classList.add("obstacle");
  board.setObstacle(pos);

  canClick = false;

  if (board.ifPlayerWins(cat.pos)) {
    messageText = "您赢了！";
    message.textContent = messageText;

    gameActive = false;
    cat.lost = true;
    placeCat();
    canClick = true;
    return;
  }

  const nextMove = cat.step(board);
  animateCatMove(nextMove).then(() => {
    if (board.ifCatWins(cat.pos)) {
      messageText = "小猫逃走了！";
      message.textContent = messageText;

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
  board.reset(INITIAL_OBSTACLES);

  messageText = "点击小圆点，围住小猫";
  message.textContent = messageText;

  for (const circle of document.querySelectorAll("circle")) {
    const pos = Position.fromString(circle.dataset.coords!);
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
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });
  window.addEventListener("load", preload);
}

function antiMutation() {
  function fuck() {
    location.reload();
  }

  // anti deletion
  {
    new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.removedNodes.length > 0 &&
          record.nextSibling &&
          record.previousSibling
        ) {
          fuck();
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // anti text mutation
  {
    new MutationObserver(() => {
      if (message.outerHTML !== `<div id="message">${messageText}</div>`) {
        fuck();
      }
    }).observe(message, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function freeze(element: HTMLElement) {
    new MutationObserver(fuck).observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  freeze(resetBtn.parentElement!);

  // anti cat mutation
  {
    new MutationObserver((records) => {
      outer: for (const record of records) {
        if (record.type === "attributes") {
          if (!record.attributeName) {
            continue;
          }

          if (record.attributeName === "href") {
            const href = catElement.href.baseVal;
            for (let frame = 1; frame <= 5; frame++) {
              const src = new URL(
                `/static/${cat.dir}/${frame}.svg`,
                import.meta.url,
              ).href;
              if (src === href) {
                continue outer;
              }
            }
          } else if (record.attributeName in catMeta) {
            const key = record.attributeName as keyof typeof catMeta;
            if (catMeta[key].toString() === catElement.getAttribute(key)) {
              continue;
            }
          }
        }
        fuck();
      }
    }).observe(catElement, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // anti svg mutation
  {
    new MutationObserver(fuck).observe(svg, {
      attributes: true,
      childList: true,
      characterData: true,
    });
  }

  // anti circle mutation
  {
    new MutationObserver((records) => {
      for (const record of records) {
        const circle = record.target as SVGCircleElement;

        if (circle.tagName !== "circle") {
          continue;
        }

        if (record.attributeName === "class") {
          const hasClass = circle.classList.contains("obstacle");
          const isObstacle = board.isObstacle(
            Position.fromString(circle.dataset.coords!),
          );
          if (hasClass !== isObstacle) {
            fuck();
          }
          for (const c of circle.classList.values()) {
            if (c !== "obstacle") {
              fuck();
            }
          }
          continue;
        }
        fuck();
      }
    }).observe(svg, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
}
