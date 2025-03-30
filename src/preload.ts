import { Directions } from "./direction";

export function preload() {
  for (const dir of Object.keys(Directions)) {
    for (let frame = 1; frame <= 5; frame++) {
      const img = document.createElement("img");
      img.src = new URL(`/static/${dir}/${frame}.svg`, import.meta.url).href;
    }
  }
}
