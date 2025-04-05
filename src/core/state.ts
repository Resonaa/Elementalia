import { Board } from "../models/board";
import type { Dir } from "../models/dir";
import { Pos } from "../models/pos";

import type { IConfig } from "./config";

export class State {
  board = new Board();
  catPos = new Pos();
  catDir: Dir = "bottom_left";
  turns = 0;
  status: "win" | "lose" | "playing" = "playing";

  constructor(public readonly config: IConfig) {}
}
