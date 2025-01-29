import "phaser";
import { SpriteOptions } from "./SpriteOptions";
import { MainGameScene } from "../MainGame";

export class BasePhysicsSprite extends Phaser.Physics.Matter.Sprite {
  ray: any;
  originalTint: number;
  isClosest: boolean = false;
  isDestructible: boolean = false;
  isAttachable: boolean = false;

  constructor(
    public _game: MainGameScene,
    key: string,
    x: number,
    y: number,
    public options: SpriteOptions
  ) {
    const shape = _game.assets.getShape(key);

    super(_game.matter.world, x, y, key, undefined, {
      label: key,
      name: key,
      shape: shape,
      ...options.physicsSettings,
    } as any);

    if (options.displayHeight && options.displayWidth)
      this.setDisplaySize(options.displayWidth, options.displayHeight);

    if (options.isResizeable) {
      //this._game.add.existing(new Resizeable(this._game, this));
    } else {
      _game.add.existing(this);
    }

    if (options.isDestructible) {
      this.isDestructible = true;
    }

    if (options.isAttachable) {
      this.isAttachable = true;
    }

    this.originalTint = this.tint;
  }

  resetTint() {
    this.setTint(this.originalTint);
  }

  preUpdate(time: number, delta: number) {
    this.resetTint();
  }

  update(time: number, delta: number) {}
}
