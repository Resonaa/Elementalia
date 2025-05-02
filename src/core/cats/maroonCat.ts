import shuffle from "lodash/shuffle";

import { reverseDir } from "../../models/dir";
import { Pos } from "../../models/pos";
import type { State } from "../state";

import { Cat } from "./cat";

export class MaroonCat extends Cat {
  name = "褐猫";
  color = "#9b0101";
  shouldWin = false;
  description = "障碍覆盖率低于50%时，围猫会导致游戏失败";
  difficulty = {
    7: 1,
    6: 1,
    5: 2,
    4: 2,
    3: 3
  };

  reset() {
    this.shouldWin = false;
  }

  checkCatWin(state: State, cur?: Pos) {
    if (this.shouldWin) {
      return true;
    }
    return super.checkCatWin(state, cur);
  }

  checkPlayerWin(state: State) {
    const won = super.checkPlayerWin(state);

    if (!won) {
      return false;
    }

    let obstacles = 0;
    let nonObstacles = 0;

    for (let q = -state.board.depth; q <= state.board.depth; q++) {
      for (let r = -state.board.depth; r <= state.board.depth; r++) {
        const pos = new Pos(q, r);
        if (state.board.checkPos(pos)) {
          if (state.board.isObstacle(pos)) {
            obstacles++;
          } else {
            nonObstacles++;
          }
        }
      }
    }

    if (obstacles / (obstacles + nonObstacles) < 0.5) {
      this.shouldWin = true;
      return false;
    }

    return true;
  }

  step(state: State) {
    if (this.shouldWin) {
      for (const next of shuffle(state.board.neighbors(state.catPos))) {
        if (next.dist() > state.catPos.dist()) {
          return [reverseDir(next.sub(state.catPos)) ?? state.catDir];
        }
      }
    }
    return super.step(state);
  }
}
