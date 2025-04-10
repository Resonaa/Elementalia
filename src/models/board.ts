import { Dirs } from "./dir";
import { Pos } from "./pos";

export class Board {
  private _obstacles = new Set<string>();

  depth = 0;

  isObstacle(pos: Pos) {
    return this._obstacles.has(pos.toString());
  }

  setObstacle(pos: Pos) {
    return this._obstacles.add(pos.toString());
  }

  clear() {
    this._obstacles.clear();
  }

  allObstacles() {
    return Array.from(this._obstacles.keys()).map(Pos.fromString);
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
