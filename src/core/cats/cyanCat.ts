import { produce } from "immer";

import { type Dir, Dirs } from "../../models/dir";
import type { State } from "../state";

import { Cat } from "./cat";

export class CyanCat extends Cat {
  name = "青猫";
  color = "#008080";
  description = "仅在偶数回合移动两步";
  difficulty = {
    7: 1,
    6: 1,
    5: 2,
    4: 2,
    3: 3
  };

  step(state: State) {
    const x = 2;

    if (state.turns % x === 0) {
      let moves: Dir[] = [];
      let newState = state;

      for (let i = 0; i < x; i++) {
        const move = super.step(newState);
        if (move.length === 0) {
          break;
        }

        const dir = move[0];
        newState = produce(newState, state => {
          state.catPos = state.catPos.add(Dirs[dir]);
        });

        moves = moves.concat(move);
      }

      return moves;
    }

    return [];
  }
}
