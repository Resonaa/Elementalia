import type { State } from "../core/state";
import type { RendererEvents } from "../events/rendererEvents";

type Listener = (e: RendererEvents) => void;

export abstract class Renderer {
  private _listeners = new Map<RendererEvents["type"], Listener>();

  render(_state: State) {}

  on<T extends RendererEvents["type"], E extends RendererEvents & { type: T }>(
    type: T,
    listener: (e: E) => void,
  ) {
    this._listeners.set(type, listener as Listener);
  }

  dispatch<E extends RendererEvents>(e: E) {
    this._listeners.get(e.type)!(e);
  }
}
