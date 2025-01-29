import { Scene } from "phaser";
import { GUI } from "dat.gui";

interface RotateableCamera extends Phaser.Cameras.Scene2D.Camera {
  rotation: number;
}

export class GameControls {
  controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  input: Phaser.Input.InputPlugin;
  mainCam: Phaser.Cameras.Scene2D.Camera;
  game: Phaser.Game;
  scene: Scene;
  keys:
    | {
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        Enter: Phaser.Input.Keyboard.Key;
        Shift: Phaser.Input.Keyboard.Key;
        Space: Phaser.Input.Keyboard.Key;
        Cursors: Phaser.Types.Input.Keyboard.CursorKeys;
      }
    | undefined;

  constructor(scene: Scene) {
    this.scene = scene;
    this.input = scene.input;
    this.mainCam = scene.cameras.main;
    this.keys = this.setupControls();
  }

  update(delta: number): void {
    this.controls.update(delta);
  }

  setupControls() {
    if (!this.input.keyboard) return;
    var cursors = this.input.keyboard.createCursorKeys();

    var controlConfig = {
      camera: this.mainCam,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.06,
      drag: 0.0005,
      maxSpeed: 1.0,
    };

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig
    );
    //this.mainCam.setBounds(0, 0, this.worldWidth, this.worldHeight);

    let AKey = this.input.keyboard.addKey("A");
    AKey.emitOnRepeat = true;

    let DKey = this.input.keyboard.addKey("D");
    DKey.emitOnRepeat = true;

    let EnterKey = this.input.keyboard.addKey("ENTER");
    EnterKey.emitOnRepeat = true;

    let ShiftKey = this.input.keyboard.addKey("SHIFT");
    ShiftKey.emitOnRepeat = true;

    let SpaceKey = this.input.keyboard.addKey("SPACE");
    SpaceKey.emitOnRepeat = true;

    let scene = this.scene;
    let cam = <RotateableCamera>this.mainCam;

    this.input.keyboard.on(
      "keydown-Z",
      function () {
        (<RotateableCamera>cam).rotation += 0.01;

        scene.matter.world.engine.world.gravity = {
          x: Math.sin(cam.rotation),
          y: Math.cos(cam.rotation),
          scale: scene.matter.world.engine.world.gravity.scale,
        };
      },
      0
    );

    this.input.keyboard.on(
      "keydown-X",
      function () {
        (<RotateableCamera>cam).rotation -= 0.01;

        scene.matter.world.engine.world.gravity = {
          x: Math.sin(cam.rotation),
          y: Math.cos(cam.rotation),
          scale: scene.matter.world.engine.world.gravity.scale,
        };
      },
      0
    );

    var settings = {
      matterDebug: true,
      minimap: false,
      isStatic: true,
      shipDensity: 1,
      showEditor: false,
    };

    let gui = new GUI({ autoPlace: true });
    let mdbg = gui.addFolder("Matter");
    mdbg.open();
    mdbg
      .add(settings, "matterDebug")
      .name("Debug")
      .listen()
      .onChange(function (value) {
        scene.matter.world.drawDebug = value;

        if (scene.matter.world.debugGraphic) {
          scene.matter.world.debugGraphic.clear();
        } else scene.matter.world.createDebugGraphic();
      });

    mdbg
      .add(settings, "minimap")
      .name("Show Minimap")
      .listen()
      .onChange(function (value) {
        //game.cameras.getCamera("minimap").setVisible(value);
      });

    let mship = gui.addFolder("Ship");
    mship
      .add(settings, "shipDensity", 1, 50)
      .name("Density")
      .listen()
      .onChange(function (value) {
        //game.ship.setDensity(value / 1000);
      });
    mship.open();

    let medit = gui.addFolder("Editor");
    medit
      .add(settings, "showEditor")
      .name("Show Editor")
      .listen()
      .onChange(function (value) {
        //game.itemManager.show(value);
      });

    medit.add(settings, "isStatic").name("Static body").listen();

    medit.open();

    return {
      A: AKey,
      D: DKey,
      Enter: EnterKey,
      Shift: ShiftKey,
      Space: SpaceKey,
      Cursors: cursors,
    };
  }
}
