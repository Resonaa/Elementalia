import { Pos } from "./pos";

export type Dir = keyof typeof Dirs;

export const Dirs = {
  bottom_left: new Pos(-1, 1),
  left: new Pos(-1, 0),
  top_left: new Pos(0, -1),
  right: new Pos(1, 0),
  top_right: new Pos(1, -1),
  bottom_right: new Pos(0, 1),
};

const reverseSearchMap = new Map<string, Dir>();

for (const [dir, value] of Object.entries(Dirs)) {
  reverseSearchMap.set(value.toString(), dir as Dir);
}

export function reverseDir(pos: Pos) {
  return reverseSearchMap.get(pos.toString());
}
