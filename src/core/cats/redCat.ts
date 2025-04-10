import { Dirs } from "../../models/dir";
import type { State } from "../state";
import { Cat } from "./cat";

export class RedCat extends Cat {
  description = "每8回合额外移动一步";
  color = "red";

  step(state: State) {
    if (state.turns % 8 === 0) {
      const move = super.step(state);
      if (move.length > 0) {
        const dir = move[0];
        const originalCatPos = state.catPos;
        state.catPos = state.catPos.add(Dirs[dir]);
        const move2 = super.step(state);
        state.catPos = originalCatPos;
        return move.concat(move2);
      }
    }
    return super.step(state);
  }
}
