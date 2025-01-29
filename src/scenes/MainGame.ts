import { Scene } from "phaser";
import ConfigDefaults from "./helpers/ConfigDefaults";
import { GameControls } from "./helpers/GameControls";
import AssetManager from "./helpers/AssetManager";
import { BasePhysicsSprite } from "./sprites/BasePhysicsSprite";

export class MainGameScene extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  worldWidth = 3000;
  worldHeight = 3000;
  controls: GameControls;
  self: Scene;
  assets: AssetManager;
  spriteList: BasePhysicsSprite[] = [];

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xffffff);
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.matter.world.drawDebug = true;
    this.matter.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.controls = new GameControls(this);

    this.drawBackground();
    this.drawNumbers();
    this.addSprites();
  }

  async addSprites() {
    this.spriteList = [
      new BasePhysicsSprite(this, "rock1", 450, 150, {
        displayWidth: 50,
        displayHeight: 50,
        physicsSettings: ConfigDefaults.DefaultPhysics1,
      }),
      new BasePhysicsSprite(this, "rock1", 650, 250, {
        displayWidth: 50,
        displayHeight: 150,
        physicsSettings: {
          ...ConfigDefaults.DefaultPhysics1,
          ignoreGravity: true,
        },
      }),
      new BasePhysicsSprite(this, "test1", 150, 150, {
        displayWidth: 150,
        displayHeight: 150,
        physicsSettings: {
          ...ConfigDefaults.DefaultPhysics1,
          ignoreGravity: true,
        },
      }),
    ];

    for (let i = 0; i < 20; i++) {
      this.spriteList.push(
        new BasePhysicsSprite(
          this,
          "rock1",
          Math.random() * 1000,
          Math.random() * 1000,
          {
            displayWidth: 5 + Math.random() * 200,
            displayHeight: 5 + Math.random() * 200,
            physicsSettings: {
              ...ConfigDefaults.DefaultPhysics1,
              ignoreGravity: true,
            },
          }
        )
      );

      this.spriteList.push(
        new BasePhysicsSprite(
          this,
          "text1",
          Math.random() * 1000,
          Math.random() * 1000,
          {
            displayWidth: 5 + Math.random() * 100,
            displayHeight: 5 + Math.random() * 100,
            physicsSettings: {
              ...ConfigDefaults.DefaultPhysics1,
              ignoreGravity: true,
              density: Math.random() * 5,
            },
          }
        )
      );
    }
  }

  update(time: number, delta: number): void {
    // make ship extend gameobject
    //this.ship.update(time, delta);

    this.controls.update(delta);

    for (let sp of this.spriteList) {
      if (Math.random() > 0.995) {
        sp.setVelocity(5 - Math.random() * 10, 5 - Math.random() * 10);
      }

      if (Math.random() > 0.995) {
        sp.setAngularVelocity(0.5 - Math.random());
      }
    }
  }

  drawBackground() {
    let bg1 = this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      "scifi-bg1"
    );
    bg1.setAlpha(0.7);
  }

  drawNumbers() {
    const div = 10;
    const spaceBetween = this.worldHeight / div;

    for (let x = 0; x < div; x++) {
      for (let y = 0; y < div; y++) {
        this.drawTextAt(x * spaceBetween, y * spaceBetween, `${x + "-" + y}`);
      }
    }
  }

  drawTextAt(x: number, y: number, text: string) {
    this.add.text(x, y, text, ConfigDefaults.TextConfig1);
  }

  async preload() {
    this.load.setPath("assets");
    this.assets = new AssetManager(this);
    await this.assets.loadManifest();
  }
}
