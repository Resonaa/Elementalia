import random from "lodash/random";

import { Directions } from "./direction";
import { Position } from "./position";

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

  checkPos(pos: Position) {
    return pos.dist(new Position()) <= this.depth;
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

  ifPlayerWins(catPos: Position) {
    const vis = new Set([catPos.toString()]);
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

  ifCatWins(pos: Position) {
    return pos.dist(new Position()) === this.depth;
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
