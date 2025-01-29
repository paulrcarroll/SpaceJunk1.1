import { Boot } from "./scenes/Boot";
import { MainGameScene as MainGame } from "./scenes/MainGame";
import { GameOver } from "./scenes/game-state/GameOver";
import { MainMenu } from "./scenes/game-state/MainMenu";
import { Preloader } from "./scenes/game-state/Preloader";

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
  physics: {
    default: "matter",
    matter: {
      gravity: {
        x: 0,
        y: 0.2,
      },
      debug: true,
      "plugins.attractors": true,
    },
    plugins: {
      wrap: false,
    },
  } as any,
};

export default new Game(config);
