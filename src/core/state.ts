import { immerable } from "immer";

import { Board } from "../models/board";
import type { Dir } from "../models/dir";
import { Pos } from "../models/pos";

import type { IConfig } from "./config";

import { BlueCat } from "./cats/blueCat";
import { Cat } from "./cats/cat";
import { GreenCat } from "./cats/greenCat";
import { RedCat } from "./cats/redCat";

const cats = [new Cat(), new RedCat(), new BlueCat(), new GreenCat()];

export class State {
  readonly [immerable] = true;

  readonly board = new Board();
  readonly catPos = new Pos();
  readonly catDir: Dir = "bottom_left";
  readonly turns = 0;
  readonly status: "win" | "lose" | "playing" = "playing";
  readonly catId = 0;

  get cat() {
    return cats[this.catId % cats.length];
  }

  constructor(public readonly config: IConfig) {}
}
