import { Renderer } from "../views/renderer";

import type { IConfig } from "./config";
import { Logic } from "./logic";
import { State } from "./state";

export class Controller {
  private _state: State;
  private _logic: Logic;

  constructor(
    config: IConfig,
    private _renderer: Renderer,
  ) {
    this._state = new State(config);
    this._logic = new Logic(this._state);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this._renderer.on("boardClick", ({ pos }) => {
      if (this._state.status === "lose") {
        this._renderer.dispatch({ type: "resetClick" });
      } else if (this._state.status === "playing") {
        if (this._logic.placeObstacle(pos)) {
          if (this._logic.checkPlayerWin()) {
            this._state.status = "win";
          } else {
            this._logic.catMove();
            if (this._logic.checkCatWin()) {
              this._state.status = "lose";
            }
          }

          this._renderer.render(this._state);
        }
      }
    });

    this._renderer.on("resetClick", () => {
      this._logic.reset();
      this._renderer.render(this._state);
    });

    this._renderer.on("difficultyClick", () => {
      this._logic.toggleDifficulty();
      this._logic.reset();
      this._renderer.render(this._state);
    });
  }

  start() {
    this._logic.reset();
    this._renderer.render(this._state);
  }
}
