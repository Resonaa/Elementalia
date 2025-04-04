import "./style.css";

import confetti from "canvas-confetti";
import { gsap } from "gsap";

import { TextPlugin } from "gsap/TextPlugin";

import { Game } from "./game";
import { Position } from "./position";
import { Directions } from "./direction";
import { step } from "./cat";

gsap.registerPlugin(TextPlugin);

const game = new Game();
game.board.depth = 7;

const svg = document.querySelector("svg")!;
const message = document.querySelector("header")!;
const catElement = document.querySelector("image")!;
const turns = document.getElementById("turns")!;

const tl = gsap.timeline({ paused: true });

initEventListeners();
resetGame();

function updateViewBox() {
  const right = new Position(game.board.depth, 0).pixelize();
  const left = new Position(-game.board.depth, 0).pixelize();
  const topLeft = new Position(0, -game.board.depth).pixelize();
  const bottomRight = new Position(0, game.board.depth).pixelize();
  const x = left.q - 1;
  const y = topLeft.r - 1;
  const w = right.q - x + 1;
  const h = bottomRight.r - y + 1;

  gsap.to(svg, {
    attr: { viewBox: `${x} ${y} ${w} ${h}` },
    ease: "power3.out",
  });
}

function generateHexGrid() {
  const circles = document.querySelectorAll("circle");

  if (circles.length === 3 * game.board.depth * (game.board.depth + 1) + 1) {
    for (const circle of circles) {
      const pos = Position.fromString(circle.dataset.coords!);
      if (game.board.isObstacle(pos)) {
        circle.classList.add("obstacle");
      } else {
        circle.classList.remove("obstacle");
      }
    }
    return;
  } else {
    updateViewBox();
  }

  for (const circle of circles) {
    circle.remove();
  }

  for (let q = -game.board.depth; q <= game.board.depth; q++) {
    for (let r = -game.board.depth; r <= game.board.depth; r++) {
      const pos = new Position(q, r);
      if (!game.board.checkPos(pos)) {
        continue;
      }

      const { q: cx, r: cy } = pos.pixelize();
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );

      gsap.set(circle, {
        attr: { cx, cy, r: 0.79 },
      });

      if (game.board.isObstacle(pos)) {
        circle.classList.add("obstacle");
      }

      circle.dataset.coords = pos.toString();

      svg.prepend(circle);
    }
  }
}

function getCatSize() {
  if (game.catDir.includes("top") || game.catDir.includes("bottom")) {
    return { width: 2, height: 2.8 };
  } else {
    return { width: 3.42, height: 1.8 };
  }
}

function getCatPos() {
  const { q, r } = game.catPos.pixelize();
  const pos = { x: 0, y: 0 };

  if (game.catDir === "bottom_left") {
    pos.x = q - 1.3;
    pos.y = r - 1.3;
  } else if (game.catDir === "bottom_right") {
    pos.x = q - 0.7;
    pos.y = r - 1.3;
  } else if (game.catDir === "left") {
    pos.x = q - 2.5;
    pos.y = r - 1.3;
  } else if (game.catDir === "right") {
    pos.x = q - 1.0;
    pos.y = r - 1.3;
  } else if (game.catDir === "top_left") {
    pos.x = q - 1.3;
    pos.y = r - 2.3;
  } else if (game.catDir === "top_right") {
    pos.x = q - 0.7;
    pos.y = r - 2.3;
  }

  return pos;
}

function placeCat() {
  const attr = {
    href: getCatHref(1),
    ...getCatPos(),
    ...getCatSize(),
  };

  for (const key in attr) {
    catElement.setAttribute(key, attr[key as keyof typeof attr].toString());
  }
}

function getCatHref(frame: number) {
  return new URL(`/static/${game.catDir}/${frame}.svg`, import.meta.url).href;
}

function animateCatMove(dir?: keyof typeof Directions) {
  return new Promise((resolve) => {
    if (!dir) {
      return resolve(false);
    }

    game.catDir = dir;
    tl.set(catElement, {
      attr: {
        href: getCatHref(1),
        ...getCatPos(),
        ...getCatSize(),
      },
    });

    game.catPos = game.catPos.add(Directions[dir]);

    const delay = 0.07;

    for (let frame = 2; frame <= 5; frame++) {
      tl.set(catElement, {
        attr: {
          href: getCatHref(frame),
        },
        delay,
      });
    }

    tl.set(catElement, {
      onComplete: () => {
        setTimeout(() => {
          const { x, y } = getCatPos();
          catElement.setAttribute("href", getCatHref(1));
          catElement.setAttribute("x", x.toString());
          catElement.setAttribute("y", y.toString());
          resolve(true);
        }, 0);
      },
    });
  });
}

function setMessage(value: string) {
  gsap.to(message, {
    text: {
      value,
      type: "diff",
      speed: 2,
    },
    overwrite: true,
  });
}

function setTurns() {
  gsap.to(turns, {
    text: {
      value: game.turns === 0 ? "" : `${game.turns}回合`,
      type: "diff",
      speed: 2,
    },
    overwrite: true,
  });
}

async function animateCatEscape() {
  for (let i = 0; i < 10; i++) {
    await animateCatMove(game.catDir);
  }
}

async function handleClick(e: PointerEvent) {
  e.preventDefault();

  if (!game.active) {
    if (!turns.textContent) {
      resetGame();
    }
    return;
  }

  const circle = e.target as SVGCircleElement;
  if (!circle || !circle.dataset.coords) {
    return;
  }

  const pos = Position.fromString(circle.dataset.coords);
  setMessage(`您点击了 (${pos.r}, ${pos.q})`);

  if (game.board.isObstacle(pos) || game.catPos.eq(pos)) {
    return;
  }

  circle.classList.add("obstacle");
  game.board.setObstacle(pos);

  game.turns++;

  if (game.ifPlayerWins()) {
    setMessage("您赢了！");
    game.active = false;
    setTurns();
    confetti({
      particleCount: 100,
      spread: 70,
    });
    return;
  }

  await animateCatMove(step(game));

  if (game.ifCatWins()) {
    setMessage("小猫逃走了！");
    game.active = false;
    animateCatEscape();
  }
}

function resetGame() {
  tl.clear();

  const x = Math.random();
  const obstacleCnt = x > 0.8 ? 5 : x > 0.5 ? 4 : 3;
  game.reset(obstacleCnt);

  setMessage("点击小圆点，围住小猫");
  setTurns();

  generateHexGrid();
  placeCat();
  tl.play();
}

function initEventListeners() {
  svg.addEventListener("pointerdown", handleClick);

  document.getElementById("reset")?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    resetGame();
  });

  document
    .getElementById("difficulty")
    ?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      game.board.depth = game.board.depth <= 3 ? 7 : game.board.depth - 1;
      resetGame();
    });

  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });
}
