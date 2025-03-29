import { sample } from "lodash";

import { Board } from "./board";
import { Directions } from "./direction";
import { Position } from "./position";

export class Cat {
  pos = new Position();
  dir: keyof typeof Directions = "bottom_left";
  lost = false;

  getDist(board: Board, from: Position, to: Position) {
    const vis = new Set();
    const q = [{ pos: from, dist: 0 }];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];
      if (cur.pos.eq(to)) {
        return cur.dist;
      }

      for (const dir of Object.values(Directions)) {
        const newPos = cur.pos.add(dir);
        if (board.checkPos(newPos) && !vis.has(newPos.toString())) {
          vis.add(newPos.toString());
          q.push({ pos: newPos, dist: cur.dist + 1 });
        }
      }
    }

    throw new Error("unaccessible dist target");
  }

  getPossibleTargets(board: Board) {
    const vis = new Set();
    const q = [{ pos: this.pos, dist: 0, next: this.pos }];
    const targets = [];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];

      if (board.ifCatWins(cur.pos)) {
        targets.push(cur);
        continue;
      }

      for (const newPos of board.neighbors(cur.pos, true)) {
        if (!vis.has(newPos.toString())) {
          vis.add(newPos.toString());
          q.push({
            pos: newPos,
            dist: cur.dist + 1,
            next: cur.dist === 0 ? newPos : cur.next,
          });
        }
      }
    }

    return targets;
  }

  getTarget(board: Board) {
    const targets = this.getPossibleTargets(board);
    let ansTarget = targets[0].next;
    let minScore = Number.MAX_SAFE_INTEGER;

    for (const target of targets) {
      let score =
        target.dist === 1
          ? Number.MIN_SAFE_INTEGER
          : (target.dist - targets[0].dist) * board.depth;
      for (const obstacleString of board.obstacles.keys()) {
        const obstaclePos = Position.fromString(obstacleString);
        const dist = this.getDist(board, target.pos, obstaclePos);
        score += board.depth / dist ** 2;
      }

      if (score < minScore) {
        minScore = score;
        ansTarget = target.next;
      }
    }

    return ansTarget;
  }

  step(board: Board) {
    const move = this.getTarget(board).sub(this.pos);

    for (const [dir, dirV] of Object.entries(Directions)) {
      if (dirV.eq(move)) {
        this.dir = dir as keyof typeof Directions;
        break;
      }
    }

    return Directions[this.dir];
  }

  reset() {
    this.pos.set(0, 0);
    this.dir = sample(Object.keys(Directions)) as keyof typeof Directions;
    this.lost = false;
  }
}
