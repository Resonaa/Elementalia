import type { State } from "../state";
import { Cat } from "./cat";

export class WhiteCat extends Cat {
  name = "白猫";
  description = "每回合增大20%";
  color = "white";
  difficulty = {
    7: 2,
    6: 3,
    5: 3,
    4: 3,
    3: 3
  };

  reset() {
    this.size = 1;
  }

  step(state: State) {
    this.size *= 1.2;
    return super.step(state);
  }
}
