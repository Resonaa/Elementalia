import random from "lodash/random";
import sample from "lodash/sample";

import { type Dir, Dirs } from "../models/dir";
import { Pos } from "../models/pos";

import type { State } from "./state";

export class Logic {
  constructor(private _state: State) {}

  placeObstacle(pos: Pos) {
    const canPlace =
      this._state.board.checkPos(pos) &&
      !this._state.board.isObstacle(pos) &&
      !this._state.catPos.eq(pos);

    if (canPlace) {
      this._state.board.setObstacle(pos);
      this._state.turns++;
    }

    return canPlace;
  }

  catMove() {
    const moves = this._state.cats[this._state.currentCatId].step(this._state);

    for (const move of moves) {
      const newPos = this._state.catPos.add(Dirs[move]);
      if (
        this._state.board.checkPos(newPos) &&
        !this._state.board.isObstacle(newPos)
      ) {
        this._state.catPos = newPos;
        this._state.catDir = move;
      }
    }
  }

  checkPlayerWin() {
    const vis = new Set([this._state.catPos.toString()]);
    const q = [this._state.catPos];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];
      if (this.checkCatWin(cur)) {
        return false;
      }

      for (const newPos of this._state.board.neighbors(cur)) {
        if (
          !this._state.board.isObstacle(newPos) &&
          !vis.has(newPos.toString())
        ) {
          vis.add(newPos.toString());
          q.push(newPos);
        }
      }
    }

    return true;
  }

  checkCatWin(catPos = this._state.catPos) {
    return catPos.dist() === this._state.board.depth;
  }

  reset() {
    this._state.board.clear();

    this._state.catPos.set(0, 0);
    this._state.catDir = sample(Object.keys(Dirs)) as Dir;

    if (this._state.board.depth <= 0) {
      this._state.board.depth = this._state.config.maxDepth;
    }

    const x = Math.random();
    const additionalObstacles = x > 0.8 ? 1 : x > 0.5 ? 0 : -1;
    const obstacleCnt = Math.max(
      additionalObstacles + this._state.config.initialObstacles,
      0
    );

    for (let i = 0; i < obstacleCnt; ) {
      const q = random(-this._state.board.depth, this._state.board.depth);
      const r = random(-this._state.board.depth, this._state.board.depth);

      const pos = new Pos(q, r);

      this.placeObstacle(pos) && i++;
    }

    this._state.turns = 0;
    this._state.status = "playing";
  }

  toggleDifficulty() {
    this._state.board.depth--;
    if (this._state.board.depth < this._state.config.minDepth) {
      this._state.board.depth = this._state.config.maxDepth;
    }
  }

  toggleCat() {
    this._state.currentCatId++;
    if (this._state.currentCatId >= this._state.cats.length) {
      this._state.currentCatId = 0;
    }
  }
}
