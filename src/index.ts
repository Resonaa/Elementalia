import "./style.css";

import type { IConfig } from "./core/config";
import { Controller } from "./core/controller";
import { SVGRenderer } from "./views/svgRenderer";

const config: IConfig = {
  initialObstacles: 4,
  maxDepth: 7,
  minDepth: 3
};

const renderer = new SVGRenderer();

const controller = new Controller(config, renderer);

controller.start();
