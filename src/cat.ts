import sample from "lodash/sample";
import shuffle from "lodash/shuffle";

import { Board } from "./board";
import { Directions } from "./direction";
import { Position } from "./position";

interface Target {
  pos: Position;
  dist: number;
  next: Position;
}

export class Cat {
  pos = new Position();
  dir: keyof typeof Directions = "bottom_left";

  getPossibleTargets(board: Board) {
    const targets = new Map<string, Target>();

    for (let i = 0; i < 3; i++) {
      const vis = new Set([this.pos.toString()]);
      const q = [{ pos: this.pos, dist: 0, next: this.pos }];

      while (q.length > 0) {
        const cur = q.splice(0, 1)[0];

        if (board.ifCatWins(cur.pos)) {
          targets.set(JSON.stringify(cur), cur);
          continue;
        }

        for (const newPos of board.neighbors(cur.pos)) {
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
    }

    return targets;
  }

  calcScore(pos: Position, board: Board) {
    let score = 0;

    for (const obstacleString of board.obstacles.keys()) {
      const obstaclePos = Position.fromString(obstacleString);
      const dist = pos.dist(obstaclePos);
      score += board.depth / dist ** 2;
    }

    return score;
  }

  getTarget(board: Board) {
    const targets = this.getPossibleTargets(board);
    let ansTarget = new Position();
    let minScore = Number.MAX_SAFE_INTEGER;
    let minDist = Number.MAX_SAFE_INTEGER;

    for (const target of targets.values()) {
      minDist = Math.min(minDist, target.dist);
    }

    for (const target of shuffle(Array.from(targets.values()))) {
      let score =
        target.dist === 1
          ? Number.MIN_SAFE_INTEGER
          : (target.dist - minDist) * board.depth;

      score += this.calcScore(target.pos, board);

      if (score < minScore) {
        minScore = score;
        ansTarget = target.next;
      }
    }

    return ansTarget;
  }

  step(board: Board) {
    const target = this.getTarget(board);

    const move = target.sub(this.pos);

    for (const [dir, dirV] of Object.entries(Directions)) {
      if (dirV.eq(move)) {
        return dir as keyof typeof Directions;
      }
    }
  }

  reset() {
    this.pos.set(0, 0);
    this.dir = sample(Object.keys(Directions)) as keyof typeof Directions;
  }
}
