import { immerable } from "immer";

import { Dirs } from "./dir";
import { Pos } from "./pos";

export class Board {
  readonly [immerable] = true;

  obstacles: Record<string, null> = Object.create(null);
  depth = 0;

  isObstacle(pos: Pos) {
    return pos.toString() in this.obstacles;
  }

  setObstacle(pos: Pos) {
    this.obstacles[pos.toString()] = null;
  }

  unsetObstacle(pos: Pos) {
    delete this.obstacles[pos.toString()];
  }

  clear() {
    this.obstacles = Object.create(null);
  }

  allObstacles() {
    return Array.from(Object.keys(this.obstacles)).map(Pos.fromString);
  }

  checkPos(pos: Pos) {
    return pos.dist() <= this.depth;
  }

  neighbors(pos: Pos) {
    const ans = [];

    for (const dir of Object.values(Dirs)) {
      const newPos = pos.add(dir);
      if (this.checkPos(newPos)) {
        ans.push(newPos);
      }
    }

    return ans;
  }
}
