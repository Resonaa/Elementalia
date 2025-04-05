import { Pos } from "../models/pos";

export type RendererEvents =
  | {
      type: "boardClick";
      pos: Pos;
    }
  | {
      type: "resetClick";
    }
  | {
      type: "difficultyClick";
    };
