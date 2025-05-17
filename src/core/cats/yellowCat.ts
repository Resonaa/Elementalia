import type { State } from "../state";

import shuffle from "lodash/shuffle";
import { reverseDir } from "../../models/dir";
import type { Pos } from "../../models/pos";
import { Cat } from "./cat";

export class YellowCat extends Cat {
  name = "黄猫";
  color = "#b3ac32";
  shouldWin = false;
  description = "若棋盘不是中心对称图形，围猫会导致游戏失败";
  difficulty = {
    7: 2,
    6: 2,
    5: 3,
    4: 3,
    3: 4
  };

  moved = new Set<string>();

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

    for (const pos of state.board.allObstacles()) {
      if (!state.board.isObstacle(pos.mulScalar(-1))) {
        this.shouldWin = true;
        return false;
      }
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
