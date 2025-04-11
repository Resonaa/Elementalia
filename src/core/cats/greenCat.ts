import { Dirs } from "../../models/dir";
import type { State } from "../state";

import { Cat } from "./cat";

export class GreenCat extends Cat {
  description = "移动后击退前方障碍";
  color = "#008000";

  step(state: State) {
    const move = super.step(state);

    for (
      let pos = state.catPos;
      state.board.checkPos(pos);
      pos = pos.add(Dirs[move[0]])
    ) {
      if (state.board.isObstacle(pos)) {
        state.board.unsetObstacle(pos);
        state.board.setObstacle(pos.add(Dirs[move[0]]));
        break;
      }
    }

    return move;
  }
}
