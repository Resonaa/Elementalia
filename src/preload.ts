import { Directions } from "./direction";

export function preload() {
  for (let frame = 1; frame <= 5; frame++) {
    for (const dir of Object.keys(Directions)) {
      new Image().src = `/${dir}/${frame}.svg`;
    }
  }
}
