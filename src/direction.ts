import { Position } from "./position";

export const Directions = {
  bottom_left: new Position(-1, 1),
  left: new Position(-1, 0),
  top_left: new Position(0, -1),
  right: new Position(1, 0),
  top_right: new Position(1, -1),
  bottom_right: new Position(0, 1),
};
