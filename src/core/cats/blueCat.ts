import { produce } from "immer";

import { Dirs } from "../../models/dir";
import type { State } from "../state";

import { Cat } from "./cat";

export class BlueCat extends Cat {
  name = "蓝猫";
  color = "blue";
  description = "周围存在至少3个障碍时，移动速度加倍";
  difficulty = {
    7: 2,
    6: 3,
    5: 3,
    4: 4,
    3: 4
  };

  step(state: State) {
    let obstacleCnt = 0;

    for (const next of state.board.neighbors(state.catPos)) {
      if (state.board.isObstacle(next)) {
        obstacleCnt++;
      }
    }

    if (obstacleCnt >= 3) {
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
