import shuffle from "lodash/shuffle";

import type { State } from "../state";

import { Pos } from "../../models/pos";
import { Cat } from "./cat";

export class OrangeCat extends Cat {
  ms = 600;
  name = "橙猫";
  color = "#fa8c01";

  lastClick = Date.now();

  reset() {
    this.lastClick = Date.now();
  }

  step(state: State) {
    const curClick = Date.now();
    const x = Math.floor((curClick - this.lastClick) / this.ms);

    let arr: [Pos, number][] = [];
    for (let q = -state.board.depth; q <= state.board.depth; q++) {
      for (let r = -state.board.depth; r <= state.board.depth; r++) {
        const pos = new Pos(q, r);
        if (state.board.isObstacle(pos)) {
          arr.push([pos, pos.dist(state.catPos)]);
        }
      }
    }

    arr = shuffle(arr);
    arr = arr.sort((a, b) => b[1] - a[1]);

    for (let i = 0; i < Math.min(x, arr.length); i++) {
      state.board.unsetObstacle(arr[i][0]);
    }

    this.lastClick = curClick;

    return super.step(state);
  }
}
