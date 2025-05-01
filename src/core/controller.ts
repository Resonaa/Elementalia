import { produce } from "immer";
import type { Renderer } from "../views/renderer";

import type { IConfig } from "./config";
import * as Logic from "./logic";
import { State } from "./state";

export class Controller {
  private _state: State;

  constructor(
    config: IConfig,
    private _renderer: Renderer
  ) {
    this._state = new State(config);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this._renderer.on("boardClick", ({ pos }) => {
      if (this._state.status === "lose") {
        this._renderer.dispatch({ type: "resetClick" });
      } else if (this._state.status === "playing") {
        if (Logic.canPlaceObstacle(this._state, pos)) {
          let newState = Logic.placeObstacle(this._state, pos);

          if (newState.cat.checkPlayerWin(newState)) {
            newState = produce(newState, state => {
              state.status = "win";
            });
          } else {
            newState = Logic.catMove(newState);
            if (newState.cat.checkCatWin(newState)) {
              newState = produce(newState, state => {
                state.status = "lose";
              });
            }
          }

          this._renderer.render(newState);
          this._state = newState;
        }
      }
    });

    this._renderer.on("resetClick", () => {
      const state = Logic.reset(this._state);
      this._renderer.render(state);
      this._state = state;
    });

    this._renderer.on("difficultyClick", () => {
      const state = Logic.reset(Logic.toggleDifficulty(this._state));
      this._renderer.render(state);
      this._state = state;
    });

    this._renderer.on("toggleCatClick", () => {
      const state = Logic.toggleCat(this._state);
      this._renderer.render(state);
      this._state = state;
    });
  }

  start() {
    const state = Logic.reset(this._state);
    this._renderer.render(state);
    this._state = state;
  }
}
