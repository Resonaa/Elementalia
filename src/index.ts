import "./style.css";

import type { IConfig } from "./core/config";
import { SVGRenderer } from "./views/svgRenderer";
import { Controller } from "./core/controller";

const config: IConfig = {
  initialObstacles: 4,
  maxDepth: 7,
  minDepth: 3,
};

const renderer = new SVGRenderer();

const controller = new Controller(config, renderer);

controller.start();
