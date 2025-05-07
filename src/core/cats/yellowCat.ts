import type { State } from "../state";

import { produce } from "immer";
import { Dirs } from "../../models/dir";
import { Pos } from "../../models/pos";
import { Cat } from "./cat";

export class YellowCat extends Cat {
  name = "黄猫";
  color = "#b3ac32";
  description = "若玩家在先前经过的格点周围放置了障碍，将其摧毁并额外移动一步";
  difficulty = {
    7: 1,
    6: 1,
    5: 2,
    4: 3,
    3: 3
  };

  moved = new Set<string>();

  reset() {
    this.moved.clear();
  }

  checkPlayerWin(state: State) {
    const newState = produce(state, state => {
      for (const str of this.moved.values()) {
        const pos = Pos.fromString(str);
        if (state.board.isObstacle(pos)) {
          state.board.unsetObstacle(pos);
        }
      }
    });
    return super.checkPlayerWin(newState);
  }

  step(state: State) {
    let double = false;

    for (const str of this.moved.values()) {
      const pos = Pos.fromString(str);
      if (state.board.isObstacle(pos)) {
        state.board.unsetObstacle(pos);
        double = true;
        break;
      }
    }

    for (const next of state.board.neighbors(state.catPos)) {
      if (!state.board.isObstacle(next)) {
        this.moved.add(next.toString());
      }
    }

    if (double) {
      const move = super.step(state);
      if (move.length > 0) {
        const dir = move[0];

        const newState = produce(state, state => {
          state.catPos = state.catPos.add(Dirs[dir]);
        });
        const move2 = super.step(newState);

        return move.concat(move2);
      }
    }
    return super.step(state);
  }
}
