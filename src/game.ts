import random from "lodash/random";
import sample from "lodash/sample";

import { Board } from "./board";
import { type Dir, Directions } from "./direction";
import { Position } from "./position";

export class Game {
  catPos = new Position();
  catDir: Dir = "bottom_left";
  board = new Board();
  turns = 0;
  active = true;

  ifPlayerWins() {
    const vis = new Set([this.catPos.toString()]);
    const q = [this.catPos];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];
      if (this.ifCatWins(cur)) {
        return false;
      }

      for (const newPos of this.board.neighbors(cur)) {
        if (!vis.has(newPos.toString())) {
          vis.add(newPos.toString());
          q.push(newPos);
        }
      }
    }

    return true;
  }

  ifCatWins(catPos = this.catPos) {
    return catPos.dist() === this.board.depth;
  }

  reset(obstacleCount: number) {
    this.board.obstacles.clear();

    for (let i = 0; i < obstacleCount; ) {
      const q = random(-this.board.depth, this.board.depth),
        r = random(-this.board.depth, this.board.depth);
      const pos = new Position(q, r);
      if (
        !this.board.checkPos(pos) ||
        (q === 0 && r === 0) ||
        this.board.isObstacle(pos)
      ) {
        continue;
      }
      this.board.setObstacle(pos);
      i++;
    }

    this.catPos.set(0, 0);
    this.catDir = sample(Object.keys(Directions)) as Dir;

    this.turns = 0;
    this.active = true;
  }
}
