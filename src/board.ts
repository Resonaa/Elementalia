import { Directions } from "./direction";
import type { Position } from "./position";

export class Board {
  obstacles = new Set<string>();
  depth = 0;

  isObstacle(pos: Position) {
    return this.obstacles.has(pos.toString());
  }

  setObstacle(pos: Position) {
    return this.obstacles.add(pos.toString());
  }

  checkPos(pos: Position) {
    return pos.dist() <= this.depth;
  }

  neighbors(pos: Position) {
    const ans = [];

    for (const dir of Object.values(Directions)) {
      const newPos = pos.add(dir);
      if (this.checkPos(newPos) && !this.isObstacle(newPos)) {
        ans.push(newPos);
      }
    }
    return ans;
  }
}
