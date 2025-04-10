import { Board } from "../models/board";
import type { Dir } from "../models/dir";
import { Pos } from "../models/pos";
import { BlueCat } from "./cats/blueCat";

import { Cat } from "./cats/cat";
import { RedCat } from "./cats/redCat";

import type { IConfig } from "./config";

export class State {
  board = new Board();
  catPos = new Pos();
  catDir: Dir = "bottom_left";
  turns = 0;
  status: "win" | "lose" | "playing" = "playing";

  cats = [new Cat(), new RedCat(), new BlueCat()];
  currentCatId = 0;

  constructor(public readonly config: IConfig) {}
}
