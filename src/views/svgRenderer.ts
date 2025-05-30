import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

import { Pos } from "../models/pos";

import type { State } from "../core/state";

import { Dirs } from "../models/dir";

import { produce } from "immer";
import Swal from "sweetalert2";
import { Renderer } from "./renderer";

gsap.registerPlugin(TextPlugin);

const LOCK_KEY = "爱猫TV";
const unlocked = localStorage.getItem(LOCK_KEY) === "true";

window.爱猫TV = () => {
  localStorage.setItem(LOCK_KEY, !unlocked);
  location.reload();
};

export class SVGRenderer extends Renderer {
  svgElem = document.querySelector("svg") as SVGSVGElement;
  messageElem = document.querySelector("header") as HTMLElement;
  catElem = document.querySelector("image") as SVGImageElement;
  turnsElem = document.getElementById("turns") as HTMLDivElement;
  resetBtn = document.getElementById("reset") as HTMLDivElement;
  difficultyBtn = document.getElementById("difficulty") as HTMLDivElement;
  toggleCatBtn = document.getElementById("cat") as HTMLDivElement;

  tl = gsap.timeline({ paused: true });

  get circleElems() {
    return document.querySelectorAll("circle");
  }

  constructor() {
    super();

    if (unlocked) {
      this.difficultyBtn.textContent = "难度";
      this.toggleCatBtn.textContent = "挑战";
      const meta = document.getElementById("meta") as HTMLDivElement;
      meta.textContent = "杨浦区青少年爱猫学院";
      document.title = "围猫高爆服 ～ Éclipse Containment";
    }

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.svgElem.addEventListener("pointerdown", e => {
      e.preventDefault();

      const circle = e.target as SVGCircleElement;
      if (!circle || !circle.dataset.coords) {
        return;
      }

      const pos = Pos.fromString(circle.dataset.coords);
      this.dispatch({ type: "boardClick", pos });
    });

    this.resetBtn.addEventListener("pointerdown", e => {
      e.preventDefault();
      this.dispatch({ type: "resetClick" });
    });

    this.difficultyBtn.addEventListener("pointerdown", e => {
      e.preventDefault();
      this.dispatch({ type: "difficultyClick" });
    });

    this.toggleCatBtn.addEventListener("pointerdown", e => {
      e.preventDefault();
      this.dispatch({ type: "toggleCatClick" });
    });

    if (import.meta.env.MODE === "production") {
      document.addEventListener("contextmenu", e => {
        e.preventDefault();
        return false;
      });

      window.addEventListener("beforeunload", e => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      });
    }

    const showHint = (e: Event) => {
      e.preventDefault();

      if (!unlocked) {
        return;
      }

      Swal.fire({
        titleText: "常见问题",
        showConfirmButton: false,
        html: `
        <div style="text-align: left">

        <b>Q1: 游戏怎么玩？</b><br>
        A1: 点击小圆点，围住小猫<br>
        <b>Q2: 是否一定有解？</b><br>
        A2: ★★★及以上难度不保证通关可行性<br>
        <b>Q3: 有没有必胜策略？</b><br>
        A3: 可以证明，初始平凡难度下即不存在必胜策略（您可能对“天使问题”感兴趣）<br>
        <b>Q4: 太简单了吧</b><br>
        A4: 意见反馈请前往作者粉丝群（不对外开放）<br>
        <b>Q5: 我发现了Bug！</b><br>
        A5: 作者实力问题<br>
        <b>Q6: 爱猫影响我积攒功德吗</b><br>
        A6: 建议花费1000元宝洗红名，否则回城后将被强制传送至天牢<br>

        </div>
        `
      });
    };

    this.messageElem.addEventListener("click", showHint);
    const meta = document.getElementById("meta") as HTMLDivElement;
    meta.addEventListener("click", showHint);
  }

  private updateViewBox(state: State) {
    const right = new Pos(state.board.depth, 0).pixelize();
    const left = new Pos(-state.board.depth, 0).pixelize();
    const topLeft = new Pos(0, -state.board.depth).pixelize();
    const bottomRight = new Pos(0, state.board.depth).pixelize();

    const x = left.q - 0.79;
    const y = topLeft.r - 0.79;
    const w = right.q - x + 0.79;
    const h = bottomRight.r - y + 0.79;

    gsap.to(this.svgElem, {
      attr: { viewBox: `${x} ${y} ${w} ${h}` },
      ease: "power3.out"
    });
  }

  private generateCircles(state: State) {
    for (const circle of this.circleElems) {
      circle.remove();
    }

    for (let q = -state.board.depth; q <= state.board.depth; q++) {
      for (let r = -state.board.depth; r <= state.board.depth; r++) {
        const pos = new Pos(q, r);
        if (!state.board.checkPos(pos)) {
          continue;
        }

        const { q: cx, r: cy } = pos.pixelize();
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );

        gsap.set(circle, {
          attr: { cx, cy, r: 0.79 }
        });
        circle.dataset.coords = pos.toString();
        this.svgElem.prepend(circle);
      }
    }
  }

  private updateCircles(state: State) {
    let newObstacle: Pos | null = null;
    for (const circle of this.circleElems) {
      const coords = circle.dataset.coords;
      if (!coords) {
        continue;
      }

      const pos = Pos.fromString(coords);

      const stateOb = state.board.isObstacle(pos);
      const circleOb = circle.classList.contains("obstacle");
      if (stateOb && !circleOb) {
        circle.classList.add("obstacle");
        newObstacle = pos;
      } else if (!stateOb && circleOb) {
        circle.classList.remove("obstacle");
      }
    }
    return newObstacle;
  }

  private updateMessage(value: string) {
    gsap.to(this.messageElem, {
      text: {
        value,
        type: "diff"
      },
      duration: 0.2,
      overwrite: true
    });
  }

  private updateTurns(value: string) {
    gsap.to(this.turnsElem, {
      text: {
        value,
        type: "diff"
      },
      duration: 0,
      overwrite: true
    });
  }

  private getCatSize({ catDir, cat: { size } }: State) {
    if (catDir.includes("top") || catDir.includes("bottom")) {
      return { width: 2 * size, height: 2.8 * size };
    }
    return { width: 3.42 * size, height: 1.8 * size };
  }

  private getCatPos({ catPos, catDir, cat: { size } }: State) {
    const { q, r } = catPos.pixelize();
    const pos = { x: 0, y: 0 };

    if (catDir === "bottom_left") {
      pos.x = q - 1.3 * size;
      pos.y = r - 1.3 * size;
    } else if (catDir === "bottom_right") {
      pos.x = q - 0.7 * size;
      pos.y = r - 1.3 * size;
    } else if (catDir === "left") {
      pos.x = q - 2.5 * size;
      pos.y = r - 1.3 * size;
    } else if (catDir === "right") {
      pos.x = q - 1.0 * size;
      pos.y = r - 1.3 * size;
    } else if (catDir === "top_left") {
      pos.x = q - 1.3 * size;
      pos.y = r - 2.3 * size;
    } else if (catDir === "top_right") {
      pos.x = q - 0.7 * size;
      pos.y = r - 2.3 * size;
    }

    return pos;
  }

  private placeCat(state: State) {
    const attr = {
      href: this.getCatHref(state, 1),
      ...this.getCatPos(state),
      ...this.getCatSize(state)
    };

    for (const key in attr) {
      this.catElem.setAttribute(key, attr[key as keyof typeof attr].toString());
    }
  }

  private getCatHref({ cat: { color }, catDir }: State, frame: number) {
    let href = new URL(
      `/src/static/${catDir.replace("right", "left")}/${frame}.svg?inline`,
      import.meta.url
    ).href;

    href = href.replace("cat-color", encodeURIComponent(color));

    if (catDir.includes("right")) {
      href = href.replace("xmlns", "transform='scale(-1 1)' xmlns");
    }

    return href;
  }

  private animateCatMove(state: State) {
    return new Promise(resolve => {
      const oldState = produce(state, state => {
        state.catPos = state.catPos.sub(Dirs[state.catDir]);
      });

      this.tl.set(this.catElem, {
        attr: {
          href: this.getCatHref(state, 1),
          ...this.getCatPos(oldState),
          ...this.getCatSize(state)
        }
      });

      const delay = 0.07;

      for (let frame = 2; frame <= 5; frame++) {
        this.tl.set(this.catElem, {
          attr: {
            href: this.getCatHref(state, frame)
          },
          delay
        });
      }

      this.tl.set(this.catElem, {
        onComplete: () => {
          setTimeout(() => {
            const { x, y } = this.getCatPos(state);
            this.catElem.setAttribute("href", this.getCatHref(state, 1));
            this.catElem.setAttribute("x", x.toString());
            this.catElem.setAttribute("y", y.toString());
            resolve(true);
          }, 0);
        }
      });
    });
  }

  private async animateCatEscape(_state: State) {
    let state = produce(_state, () => {});

    for (let i = 0; i < 20; i++) {
      await this.animateCatMove(state);
      state = produce(state, state => {
        state.catPos = state.catPos.add(Dirs[state.catDir]);
      });
    }
  }

  private confetti() {
    confetti({
      particleCount: 100,
      spread: 70
    });
  }

  private hideButtons() {
    gsap.to("#difficulty, #cat", { autoAlpha: 0, duration: 0.2 });
    gsap.to(this.turnsElem, { autoAlpha: 1, duration: 0.2 });
  }

  private showButtons() {
    gsap.to("#difficulty, #cat", { autoAlpha: 1, duration: 0.2 });
    gsap.to(this.turnsElem, { autoAlpha: 0, duration: 0.2 });
  }

  render(state: State) {
    // circles need re-generating
    if (
      this.circleElems.length !==
      3 * state.board.depth * (state.board.depth + 1) + 1
    ) {
      this.updateViewBox(state);
      this.generateCircles(state);
    }

    state.turns !== 0 && this.updateTurns(state.turns);

    const newObstacle = this.updateCircles(state);

    switch (state.status) {
      case "win": {
        // player has just won the game, we should update message and confetti
        this.updateMessage("您赢了！");
        this.confetti();
        break;
      }
      case "lose": {
        // player has lost, we should play cat escape animation and update message
        this.updateMessage(`${state.cat.name}逃走了！`);
        this.animateCatEscape(state);
        break;
      }
      case "playing": {
        if (state.turns === 0) {
          // game has just been reset, we should place cat in the middle, update message,
          // clear existing animation and remove turns display
          this.tl.clear();
          this.updateMessage(state.cat.description);
          this.placeCat(state);
          this.showButtons();
          this.updateTurns(
            "★".repeat(
              state.cat.difficulty[
                state.board.depth as keyof typeof state.cat.difficulty
              ]
            )
          );
          this.tl.play();
        } else {
          // player has clicked a circle, we should play cat move animation and update message
          newObstacle &&
            this.updateMessage(`您点击了 (${newObstacle.q}, ${newObstacle.r})`);
          this.animateCatMove(state);
          state.turns === 1 && this.hideButtons();
        }
        break;
      }
    }
  }
}
