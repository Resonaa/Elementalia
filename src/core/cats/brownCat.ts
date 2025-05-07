import type { State } from "../state";

import { produce } from "immer";
import { Pos } from "../../models/pos";
import { Cat } from "./cat";

export class BrownCat extends Cat {
  name = "棕猫";
  color = "#9a5e24";
  description = "障碍不可见";
  difficulty = {
    7: 1,
    6: 1,
    5: 2,
    4: 3,
    3: 3
  };

  obstacles = new Set<string>();

  reset() {
    this.obstacles.clear();
  }

  createNewState(state: State) {
    return produce(state, state => {
      for (const obstacle of this.obstacles.values()) {
        state.board.setObstacle(Pos.fromString(obstacle));
      }
    });
  }

  checkCatWin(state: State, cur?: Pos) {
    return super.checkCatWin(this.createNewState(state), cur);
  }

  checkPlayerWin(state: State) {
    return super.checkPlayerWin(this.createNewState(state));
  }

  step(state: State) {
    for (const obstacle of state.board.allObstacles()) {
      this.obstacles.add(obstacle.toString());
      state.board.unsetObstacle(obstacle);
    }

    const newState = this.createNewState(state);

    return super.step(newState);
  }
}
