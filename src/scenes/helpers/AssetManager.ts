import { Scene } from "phaser";
import { SvgHelper } from "./SvgHelper";
import { MarchingSquares } from "../util/marchingSquares";

export default class AssetManager {
  private shapeCache: { [key: string]: any } = {};
  loader: Phaser.Loader.LoaderPlugin;

  constructor(private scene: Scene) {
    this.loader = new Phaser.Loader.LoaderPlugin(scene);
  }

  public async loadManifest() {
    await this.loadObject("text1", "/texttest2.png");

    await this.loadObject("rock1", "/rock2.svg");
    await this.loadObject("test1", "/ship1.png");
  }

  public async loadObject(key: string, path: string) {
    this.loader.setPath("assets");
    this.scene.load.image(key, path);
    this.loader.image(key, path);

    this.loader.once(Phaser.Loader.Events.COMPLETE, () => {
      // texture loaded so use instead of the placeholder
      console.log("Image loaded");
    });
    this.loader.start();

    await this.makeShapeFromTexture(key);
  }

  public getShape(key: string) {
    return this.shapeCache[key] ?? this.throwError(`key [${key}] not found`);
  }

  private throwError(errorMessage: string): never {
    throw new Error(errorMessage);
  }

  /*
  private async makePhysicsShapeFromSvg(key: string, path: string) {
    let points = await SvgHelper.getOutlineSync(path);
    var shape = this.defaultPhysicsConfig(key, points);
    this.shapeCache[key] = shape;

    return shape;
  }
  */

  makeShapeFromTextureLazy(key: string) {
    let game = this.scene;
    let assets = this;

    // texture loaded so use instead of the placeholder
    const img = game.textures.get(key);
    let width = img.source[0].width;
    let height = img.source[0].height;

    let canvas = game.textures.createCanvas(key + "-tmp", width, height);
    var ctx = canvas.context;
    ctx.drawImage(<CanvasImageSource>img.getSourceImage(), 0, 0, width, height);
    canvas.refresh();

    const accuracy = 0.2;
    const imgData = ctx.getImageData(0, 0, 1000, 1000).data;
    const msq = new MarchingSquares(imgData);
    var contour = new MarchingSquares(imgData).march();
    contour = msq.simplify(contour, 1 / accuracy, undefined);

    /*var points = _.map(contour, function (p: any[]) {
        return { x: p[0], y: p[1] };
      });
      */
    var points = contour.map((p) => {
      return { x: p[0], y: p[1] };
    });

    assets.shapeCache[key] = assets.defaultPhysicsConfig(key, points);
    canvas.destroy();

    this.loader.start();
  }

  makeShapeFromTexture(key: string) {
    let game = this.scene;
    let assets = this;

    this.loader.once(Phaser.Loader.Events.COMPLETE, () => {
      // texture loaded so use instead of the placeholder
      const img = game.textures.get(key);
      let width = img.source[0].width;
      let height = img.source[0].height;

      let canvas = game.textures.createCanvas(key + "-tmp", width, height);
      var ctx = canvas.context;
      ctx.drawImage(
        <CanvasImageSource>img.getSourceImage(),
        0,
        0,
        width,
        height
      );
      canvas.refresh();

      const accuracy = 0.3;
      const imgData = ctx.getImageData(0, 0, 1000, 1000).data;
      const msq = new MarchingSquares(imgData);
      var contour = new MarchingSquares(imgData).march();
      contour = msq.simplify(contour, 1 / accuracy, undefined);

      var points = contour.map((p) => {
        return { x: p[0], y: p[1] };
      });

      assets.shapeCache[key] = assets.defaultPhysicsConfig(key, points);
      canvas.destroy();
    });

    this.loader.start();
  }

  defaultPhysicsConfig(key: string, points: any[]) {
    return {
      type: "fromPhysicsEditor",
      label: key,
      isStatic: false,
      collisionFilter: {
        group: 0,
        category: 1,
        mask: 255,
      },
      fixtures: [
        {
          label: key,
          vertices: [points],
        },
      ],
    };
  }
}
