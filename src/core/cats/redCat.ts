import { produce } from "immer";

import { Dirs } from "../../models/dir";
import type { State } from "../state";

import { Cat } from "./cat";

export class RedCat extends Cat {
  name = "红猫";
  color = "red";
  description = "每8回合额外移动一步";
  difficulty = 1;

  step(state: State) {
    if (state.turns % 8 === 0) {
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
