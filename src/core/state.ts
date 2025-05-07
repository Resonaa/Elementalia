import { immerable } from "immer";

import { Board } from "../models/board";
import type { Dir } from "../models/dir";
import { Pos } from "../models/pos";

import type { IConfig } from "./config";

import { BlueCat } from "./cats/blueCat";
import { BrownCat } from "./cats/brownCat";
import { Cat } from "./cats/cat";
import { CyanCat } from "./cats/cyanCat";
import { GreenCat } from "./cats/greenCat";
import { MaroonCat } from "./cats/maroonCat";
import { OrangeCat } from "./cats/orangeCat";
import { PinkCat } from "./cats/pinkCat";
import { PurpleCat } from "./cats/purpleCat";
import { RedCat } from "./cats/redCat";
import { YellowCat } from "./cats/yellowCat";

const cats = [
  new Cat(),
  new RedCat(),
  new BlueCat(),
  new GreenCat(),
  new CyanCat(),
  new OrangeCat(),
  new PinkCat(),
  new PurpleCat(),
  new MaroonCat(),
  new YellowCat(),
  new BrownCat()
];

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
