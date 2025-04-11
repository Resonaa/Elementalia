import random from "lodash/random";
import sample from "lodash/sample";

import { produce } from "immer";
import { type Dir, Dirs } from "../models/dir";
import { Pos } from "../models/pos";
import type { State } from "./state";

export function canPlaceObstacle(state: State, pos: Pos) {
  return (
    state.board.checkPos(pos) &&
    !state.board.isObstacle(pos) &&
    !state.catPos.eq(pos)
  );
}

export function placeObstacle(state: State, pos: Pos) {
  return produce(state, state => {
    state.board.setObstacle(pos);
    state.turns++;
  });
}

export function catMove(state: State) {
  return produce(state, state => {
    const cat = state.cat;
    const moves = cat.step(state);

    for (const move of moves) {
      const newPos = state.catPos.add(Dirs[move]);
      if (state.board.checkPos(newPos) && !state.board.isObstacle(newPos)) {
        state.catPos = newPos;
        state.catDir = move;
      }
    }
  });
}

export function checkPlayerWin(state: State) {
  const vis = new Set([state.catPos.toString()]);
  const q = [state.catPos];

  while (q.length > 0) {
    const cur = q.splice(0, 1)[0];
    if (checkCatWin(state, cur)) {
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

export function checkCatWin(state: State, catPos = state.catPos) {
  return catPos.dist() === state.board.depth;
}

export function reset(state: State) {
  return produce(state, state => {
    state.board.clear();

    state.catPos.set(0, 0);
    state.catDir = sample(Object.keys(Dirs)) as Dir;

    state.cat.reset();

    if (state.board.depth <= 0) {
      state.board.depth = state.config.maxDepth;
    }

    const x = Math.random();
    const additionalObstacles = x > 0.8 ? 1 : x > 0.5 ? 0 : -1;
    const obstacleCnt = Math.max(
      additionalObstacles + state.config.initialObstacles,
      0
    );

    for (let i = 0; i < obstacleCnt; ) {
      const q = random(-state.board.depth, state.board.depth);
      const r = random(-state.board.depth, state.board.depth);

      const pos = new Pos(q, r);

      if (canPlaceObstacle(state, pos)) {
        state.board.setObstacle(pos);
        i++;
      }
    }

    state.turns = 0;
    state.status = "playing";
  });
}

export function toggleDifficulty(state: State) {
  return produce(state, state => {
    state.board.depth--;
    if (state.board.depth < state.config.minDepth) {
      state.board.depth = state.config.maxDepth;
    }
  });
}

export function toggleCat(state: State) {
  return produce(state, state => {
    state.catId++;
  });
}
