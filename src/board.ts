import { Directions } from "./direction";
import { Position } from "./position";
import random from "lodash/random";
import shuffle from "lodash/shuffle";

export class Board {
  obstacles = new Set<string>();
  depth;

  constructor(depth: number) {
    this.depth = depth;
  }

  isObstacle(pos: Position) {
    return this.obstacles.has(pos.toString());
  }

  setObstacle(pos: Position) {
    return this.obstacles.add(pos.toString());
  }

  checkPos({ q, r }: Position) {
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= this.depth;
  }

  neighbors(pos: Position, needRandom = false) {
    const ans = [];
    let dirs = Object.values(Directions);
    if (needRandom) {
      dirs = shuffle(dirs);
    }

    for (const dir of dirs) {
      const newPos = pos.add(dir);
      if (this.checkPos(newPos) && !this.isObstacle(newPos)) {
        ans.push(newPos);
      }
    }
    return ans;
  }

  ifPlayerWins(catPos: Position) {
    const vis = new Set();
    const q = [catPos];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];
      if (this.ifCatWins(cur)) {
        return false;
      }

      for (const newPos of this.neighbors(cur)) {
        if (!vis.has(newPos.toString())) {
          vis.add(newPos.toString());
          q.push(newPos);
        }
      }
    }

    return true;
  }

  ifCatWins({ q, r }: Position) {
    return (
      Math.abs(q) === this.depth ||
      Math.abs(r) === this.depth ||
      Math.abs(q + r) === this.depth
    );
  }

  reset(obstacleCount: number) {
    this.obstacles.clear();

    for (let i = 0; i < obstacleCount; ) {
      const q = random(-this.depth, this.depth),
        r = random(-this.depth, this.depth);
      const pos = new Position(q, r);
      if (!this.checkPos(pos) || (q === 0 && r === 0)) {
        continue;
      }
      this.setObstacle(pos);
      i++;
    }
  }
}
