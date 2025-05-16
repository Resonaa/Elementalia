import shuffle from "lodash/shuffle";

import { reverseDir } from "../../models/dir";
import { Pos } from "../../models/pos";
import type { State } from "../state";

export class Cat {
  color = "black";
  name = "小猫";
  size = 1;
  description = "点击小圆点，围住小猫";
  difficulty = {
    7: 0,
    6: 1,
    5: 1,
    4: 2,
    3: 3
  };

  reset() {}

  checkCatWin(state: State, cur = state.catPos) {
    return cur.dist() === state.board.depth;
  }

  checkPlayerWin(state: State) {
    const vis = new Set([state.catPos.toString()]);
    const q = [state.catPos];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];
      if (this.checkCatWin(state, cur)) {
        return false;
      }

      for (const newPos of state.board.neighbors(cur)) {
        if (!state.board.isObstacle(newPos) && !vis.has(newPos.toString())) {
          vis.add(newPos.toString());
          q.push(newPos);
        }
      }
    }

    return true;
  }

  step(state: State) {
    interface Target {
      pos: Pos;
      dist: number;
      next: Pos;
    }

    function getPossibleTargets() {
      const targets = new Map<string, Target>();

      for (let i = 0; i < 3; i++) {
        const vis = new Set([state.catPos.toString()]);
        const q = [{ pos: state.catPos, dist: 0, next: state.catPos }];

        while (q.length > 0) {
          const cur = q.splice(0, 1)[0];

          if (cur.pos.dist() === state.board.depth) {
            targets.set(JSON.stringify(cur), cur);
            continue;
          }

          for (const newPos of state.board.neighbors(cur.pos)) {
            if (
              !state.board.isObstacle(newPos) &&
              !vis.has(newPos.toString())
            ) {
              vis.add(newPos.toString());
              q.push({
                pos: newPos,
                dist: cur.dist + 1,
                next: cur.dist === 0 ? newPos : cur.next
              });
            }
          }
        }
      }

      return targets;
    }

    function calcScore(pos: Pos) {
      let score = 0;

      for (const obstacle of state.board.allObstacles()) {
        const dist = pos.dist(obstacle);
        score += state.board.depth / dist ** 2;
      }

      return score;
    }

    function getTarget() {
      const targets = getPossibleTargets();
      let ansTarget = new Pos();
      let minScore = Number.MAX_SAFE_INTEGER;
      let minDist = Number.MAX_SAFE_INTEGER;

      for (const target of targets.values()) {
        minDist = Math.min(minDist, target.dist);
      }

      for (const target of shuffle(Array.from(targets.values()))) {
        let score =
          target.dist === 1
            ? Number.MIN_SAFE_INTEGER
            : (target.dist - minDist) * state.board.depth;

        score += calcScore(target.pos);

        if (score < minScore) {
          minScore = score;
          ansTarget = target.next;
        }
      }

      return ansTarget;
    }

    if (state.catPos.dist() === state.board.depth) {
      return [];
    }

    const target = getTarget();

    const move = target.sub(state.catPos);

    const dir = reverseDir(move);

    return dir ? [dir] : [];
  }
}
