import shuffle from "lodash/shuffle";

import { Directions } from "./direction";
import { Position } from "./position";
import { type Game } from "./game";

interface Target {
  pos: Position;
  dist: number;
  next: Position;
}

function getPossibleTargets(game: Game) {
  const targets = new Map<string, Target>();

  for (let i = 0; i < 3; i++) {
    const vis = new Set([game.catPos.toString()]);
    const q = [{ pos: game.catPos, dist: 0, next: game.catPos }];

    while (q.length > 0) {
      const cur = q.splice(0, 1)[0];

      if (game.ifCatWins(cur.pos)) {
        targets.set(JSON.stringify(cur), cur);
        continue;
      }

      for (const newPos of game.board.neighbors(cur.pos)) {
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

function calcScore(game: Game, pos: Position) {
  let score = 0;

  for (const obstacleString of game.board.obstacles.keys()) {
    const obstaclePos = Position.fromString(obstacleString);
    const dist = pos.dist(obstaclePos);
    score += game.board.depth / dist ** 2;
  }

  return score;
}

function getTarget(game: Game) {
  const targets = getPossibleTargets(game);
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
        : (target.dist - minDist) * game.board.depth;

    score += calcScore(game, target.pos);

    if (score < minScore) {
      minScore = score;
      ansTarget = target.next;
    }
  }

  return ansTarget;
}

export function step(game: Game) {
  if (game.ifCatWins()) {
    return undefined;
  }

  const target = getTarget(game);

  const move = target.sub(game.catPos);

  for (const [dir, dirV] of Object.entries(Directions)) {
    if (dirV.eq(move)) {
      return dir as keyof typeof Directions;
    }
  }
}
