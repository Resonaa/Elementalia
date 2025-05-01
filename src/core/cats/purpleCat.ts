import type { State } from "../state";

import { Cat } from "./cat";

export class PurpleCat extends Cat {
  name = "紫猫";
  color = "#800080";
  lives = 1;
  shouldModify = false;
  description = "濒死时消灭全部障碍，仅可触发1次";
  difficulty = 2;

  reset() {
    this.lives = 1;
    this.shouldModify = false;
  }

  checkPlayerWin(state: State) {
    const won = super.checkPlayerWin(state);

    if (!won) {
      return false;
    }

    if (this.lives > 0) {
      this.lives--;
      this.shouldModify = true;
      return false;
    }

    return true;
  }

  step(state: State) {
    if (this.shouldModify) {
      for (const pos of state.board.allObstacles()) {
        state.board.unsetObstacle(pos);
      }
      this.shouldModify = false;
    }
    return super.step(state);
  }
}
