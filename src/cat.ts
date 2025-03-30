import sample from "lodash/sample";

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
  lost = false;

  distCache = new Map();

  getDist(board: Board, from: Position, to: Position) {
    const cacheKey = `${board.depth}:${from},${to}`;
    if (this.distCache.has(cacheKey)) {
      return this.distCache.get(cacheKey);
    }

    const vis = new Set();
    const q = [{ pos: from, dist: 0 }];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];
      if (cur.pos.eq(to)) {
        this.distCache.set(cacheKey, cur.dist);
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
    const targets = new Map<string, Target>();

    for (let i = 0; i < 3; i++) {
      const vis = new Set();
      const q = [{ pos: this.pos, dist: 0, next: this.pos }];

      while (q.length > 0) {
        const cur = q.splice(0, 1)[0];

        if (board.ifCatWins(cur.pos)) {
          targets.set(JSON.stringify(cur), cur);
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
    }

    return targets;
  }

  getTarget(board: Board) {
    const targets = this.getPossibleTargets(board);
    let ansTarget = new Position();
    let minScore = Number.MAX_SAFE_INTEGER;
    let minDist = Number.MAX_SAFE_INTEGER;

    for (const target of targets.values()) {
      minDist = Math.min(minDist, target.dist);
    }

    for (const target of targets.values()) {
      let score =
        target.dist === 1
          ? Number.MIN_SAFE_INTEGER
          : (target.dist - minDist) * board.depth;

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
