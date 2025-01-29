import * as Phaser from 'phaser';
import { Vertices, Vector, Query, World } from "matter-js";
import { Utils, Vertex } from './utils';
import { BaseScene } from '../base/baseScene';

declare var marchingSquares: any;

export interface ClipInfo {
    points: any[];
}

export class CanvasUtils {

    static canvas: Phaser.Textures.CanvasTexture;
    static graphics: Phaser.GameObjects.Graphics;
    static genCount: number = 0;

    static makeDebugCanvas(scene: BaseScene, canvasName:string, x: number, y: number, width: number = 1000, height: number = 1000) {
        
        var testObj = scene.add.sprite(1500, 100, 'test1').setAngle(20);

        let points = [{x: testObj.x + 100, y: testObj.y + 0}, {x: testObj.x + 150, y: testObj.y + 0}, {x: testObj.x + 200, y: testObj.y + 150}, {x: testObj.x + 50, y: testObj.y + 150}];
        this.clipTextureDebug(scene, testObj, "clipImage1", points);

        this.canvas = scene.textures.createCanvas(canvasName, width, height);
        let ctx = this.canvas.context;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        this.canvas.drawFrame("clipImage1", 0, 0, 0);
        ctx.save();

        this.drawShape(ctx, points);
        this.canvas.refresh();
        
        let canvasImage = scene.add.image(x, y, canvasName).setOrigin(0, 0);
        canvasImage.setDepth(1);
    }

    static drawToDebugCanvas(textureName, x, y) {
        let ctx = this.canvas.context;
        this.canvas.drawFrame(textureName, x, y, 0);
        ctx.save();
        this.canvas.refresh();
    }

    static drawShape(ctx, points, strokeStyle = "#000000") {
        ctx.strokeStyle = strokeStyle;

        ctx.moveTo(points[0].x, points[0].y);
        ctx.beginPath();
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[0].x, points[0].y);
        ctx.closePath();
        ctx.stroke();
    }

    static makeShape(ctx, points, scale, height, width, offset) {
        ctx.moveTo((points[0].x * scale) + (width / 2) + offset.x, (points[0].y * scale) + (height / 2) + offset.y);
        ctx.beginPath();
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo((points[i].x * scale) + (width / 2) + offset.x, (points[i].y * scale) + (height / 2) + offset.y);
        }
        ctx.lineTo((points[0].x * scale) + width / 2 + offset.x, (points[0].y * scale) + (height / 2)) + offset.y;
        ctx.closePath();
    }

    static normalizeVertices(sourceObject, subObject, rotation, debugCanvasCtx) {

        let sourceCenter = Vertices.centre(sourceObject);
        let subCenter = Vertices.centre(subObject);

        var rotatedSource = sourceObject.map((v) => {
            return Utils.rotate(sourceCenter.x, sourceCenter.y, v.x, v.y, rotation);
        });

        let srcBox = Utils.getBounds(rotatedSource);

        var translatedSource = rotatedSource.map((v) => {
            return {
                x: v.x - srcBox.topLeft.x,
                y: v.y - srcBox.topLeft.y
            };
        });

        var rotatedSub = subObject.map((v) => {
            return Utils.rotate(sourceCenter.x, sourceCenter.y, v.x, v.y, rotation);
        });

        var translatedSub = rotatedSub.map((v) => {
            return {
                x: v.x - srcBox.topLeft.x,
                y: v.y - srcBox.topLeft.y
            };
        });

        if (debugCanvasCtx) {
            //debugCanvasCtx.font = "10px Arial";
            //debugCanvasCtx.fillText("rotation: " + Phaser.Math.RadToDeg(rotation).toFixed(), 120, 120);

            this.drawShape(debugCanvasCtx, translatedSource);
            this.drawShape(debugCanvasCtx, translatedSub);
            debugCanvasCtx.translate(120, 0);
        }

        return translatedSub;
    }

    
    static clipTextureDebug2(scene: BaseScene, parentObject: Phaser.GameObjects.Sprite, resultCanvasName: string, worldPoints: Vertex[]) {
        
        let scale = 1;

        const sourceTexture = parentObject.texture.getSourceImage();
        let scaledTxWidth = sourceTexture.width * parentObject.scaleX;
        let scaledTxHeight = sourceTexture.width * parentObject.scaleY;

        let spriteBounds = parentObject.getBounds();

        const clipBounds = Utils.getBounds(worldPoints);

        let rotatedTopLeft = Utils.rotate(spriteBounds.centerX, spriteBounds.centerY, clipBounds.topLeft.x, clipBounds.topLeft.y, -parentObject.rotation);
        let clipOffsetX = rotatedTopLeft.x - spriteBounds.left;
        let clipOffsetY = rotatedTopLeft.y - spriteBounds.top;

        let rotatedVerts = worldPoints.map((v) => {
            return Utils.rotate(spriteBounds.centerX, spriteBounds.centerY, v.x, v.y, -parentObject.rotation);
        });

        if (clipBounds.width > 10 && clipBounds.height > 10) {

            // make canvas size bbox of clip mask
            // translate texture diff
            var resultCanvas = scene.textures.list[resultCanvasName];
            if (!resultCanvas) {
                resultCanvas = scene.textures.createCanvas(resultCanvasName, clipBounds.width, clipBounds.height);
            }
            var resultCtx = resultCanvas.context;

            let zeroBasedVerts = rotatedVerts.map((v) => {
                return { x: v.x - clipOffsetX - spriteBounds.x, y: v.y - clipOffsetY - spriteBounds.y }
            });

            this.makeShape(resultCtx, zeroBasedVerts, scale, 0, 0, { x: 0, y: 0 });
            resultCtx.clip();
            
            resultCtx.fillStyle = "green";
            resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

            // rotate
            /*
            resultCtx.translate(scaledTxWidth / 2, scaledTxHeight / 2);
            resultCtx.rotate(parentObject.rotation);
            resultCtx.translate(-scaledTxWidth / 2, -scaledTxHeight / 2);
            */

            resultCtx.drawImage(sourceTexture, -clipOffsetX, -clipOffsetY, sourceTexture.width * parentObject.scaleX, sourceTexture.height * parentObject.scaleY);
           
            resultCanvas.refresh();           
            return resultCanvas;
        } else {
            var x = "why?";
            return null;
        }
    }
    
    static vertexListToPoints(vertices: Vertex[]) : number[] {
        let points = [];

        for (let i = 0; i < vertices.length; i++) {
            points.push(vertices[i].x);
            points.push(vertices[i].y);
        }

        return points;
    }

    static clipTextureDebug(scene: BaseScene, parentObject: Phaser.GameObjects.Sprite, resultCanvasName: string, worldPoints: Vertex[]) {
        
        let scale = 1;

        const sourceTexture = parentObject.texture.getSourceImage();

        let scaledTxWidth = sourceTexture.width * parentObject.scaleX;
        let scaledTxHeight = sourceTexture.width * parentObject.scaleY;

        let spriteBounds = parentObject.getBounds();
        let clipBounds = Utils.getBounds(worldPoints);

        let relativeVerts = worldPoints.map((v) => {

            return { 
                x: (v.x - parentObject.x) + (spriteBounds.width / 2), 
                y: (v.y - parentObject.y) + (spriteBounds.height / 2) 
            }
        });

        var r2 = Utils.drawDebugPolygon(scene, parentObject.x, parentObject.y, relativeVerts, 0xee66ff);
        r2.x = r2.x - ((spriteBounds.width - r2.width) / 2);
        r2.y = r2.y - ((spriteBounds.height - r2.height) / 2);

        Utils.drawDebugText(scene, r2.x, r2.y, (this.genCount++).toString());


        var spriteBoundsRect = Utils.drawDebugRectangle(scene, parentObject.x, parentObject.y, spriteBounds.width, spriteBounds.height);
        var textureRect = Utils.drawDebugRectangle(scene, parentObject.x - ((spriteBounds.width - scaledTxWidth) / 2), parentObject.y - ((spriteBounds.height - scaledTxHeight) / 2), scaledTxWidth, scaledTxHeight, false, 4, 0xffaaaa);

        var textureRectRotated = Utils.drawDebugRectangle(scene, parentObject.x, parentObject.y, scaledTxWidth, scaledTxHeight, false, 4, 0x4488ff);
        textureRectRotated.setRotation(parentObject.rotation);

        const relativeClipBox = Utils.getBounds(relativeVerts);
        let xOffset = relativeClipBox.topLeft.x;
        let yOffset = relativeClipBox.topLeft.y;

        var textureRectRotated = Utils.drawDebugRectangle(scene, clipBounds.topLeft.x + (clipBounds.width / 2),  clipBounds.topLeft.y + (clipBounds.height / 2), clipBounds.width, clipBounds.height, false, 2, 0xffff55);
      

        let zeroBasedVerts = relativeVerts.map((v) => {
            return { x: v.x - xOffset, y: v.y - yOffset }
        });

        if (relativeClipBox.width > 10 && relativeClipBox.height > 10) {

            // make canvas size bbox of clip mask
            // translate texture diff
            var resultCanvas = scene.textures.list[resultCanvasName];
            if (!resultCanvas) {
                resultCanvas = scene.textures.createCanvas(resultCanvasName, relativeClipBox.width, relativeClipBox.height);
            }
            var resultCtx = resultCanvas.context;

            this.makeShape(resultCtx, zeroBasedVerts, scale, 0, 0, { x: 0, y: 0 });
            resultCtx.clip();            
            resultCtx.fillStyle = "green";
            resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

            resultCtx.drawImage(sourceTexture, -xOffset, -yOffset, sourceTexture.width * parentObject.scaleX, sourceTexture.height * parentObject.scaleY);

            // rotate
            /*
            resultCtx.translate(scaledTxWidth / 2, scaledTxHeight / 2);
            resultCtx.rotate(parentObject.rotation);
            resultCtx.translate(-scaledTxWidth / 2, -scaledTxHeight / 2);
            */

            resultCtx.translate(clipBounds.width / 2, clipBounds.height / 2);
            resultCtx.rotate(parentObject.rotation);
            resultCtx.translate(-clipBounds.width / 2, -clipBounds.height / 2);

            // translate to clip bounds
            resultCtx.drawImage(sourceTexture, -xOffset, -yOffset, sourceTexture.width * parentObject.scaleX, sourceTexture.height * parentObject.scaleY);
           

            resultCanvas.refresh();           
            return resultCanvas;
        } else {
            var x = "why?";
            return null;
        }
    }

    static clipTexture(scene, canvasName, sourceTextureName, points, rotation, scaleX, scaleY) {
        const bbox = Utils.getBounds(points);
        let width = bbox.bottomRight.x - bbox.topLeft.x;
        let height = bbox.bottomRight.y - bbox.topLeft.y;
        let scale = 1;
        const img = scene.textures.get(sourceTextureName).getSourceImage();

        let cwidth = img.width * scaleX;
        let cheight = img.width * scaleY;

        if (width > 10 && height > 10) {

            var canvas = scene.textures.list[canvasName];
            if (!canvas) {
                canvas = scene.textures.createCanvas(canvasName, cwidth, cheight);
            }
            var ctx = canvas.context;

            let debugCanvas = scene.textures.list["debug-canvas"];
            let debugCtx = debugCanvas.context;

            this.makeShape(ctx, points, scale, 0, 0, { x: 0, y: 0 });
            //ctx.strokeRect(0,0 ,canvas.width,canvas.height);
            ctx.clip();
            ctx.drawImage(img, 0, 0, img.width * scaleX, img.height * scaleY);
            canvas.refresh();
            /*
            if (textureCount <= 2) {
            debugCtx.drawImage(img, (textureCount * 200), 0, img.width * scaleX, img.height * scaleY);
            debugCtx.strokeStyle = "#ff0000";
            debugCtx.fillStyle = "#444488";
            debugCtx.lineWidth = 1;
            makeShape(debugCtx, points, scale, 0, 0, {x: textureCount * 200, y: 0});
            debugCtx.stroke();
            debugCanvas.refresh();
            }
            */

            // move to 0,0
            let canvas2 = scene.textures.createCanvas(canvasName + "tmp", width, height);
            const ctx2 = canvas2.getContext('2d');
            ctx2.translate(-bbox.topLeft.x, -bbox.topLeft.y);
            ctx2.drawImage(canvas.canvas, 0, 0);
            //ctx2.strokeRect(0,0,canvas2.width,canvas2.height);
            canvas2.refresh();

            var rotatedVerts = points.map((v) => {
                return Utils.rotate(width / 2, height / 2, v.x, v.y, rotation);
            });
            const rbox = Utils.getBounds(rotatedVerts);
            let rwidth = rbox.bottomRight.x - rbox.topLeft.x;
            let rheight = rbox.bottomRight.y - rbox.topLeft.y;

            // really?
            let canvas3 = scene.textures.createCanvas(canvasName + "x", 150, 150);
            const ctx3 = canvas3.getContext('2d');

            // ctx3.strokeStyle = "#ff0000";
            // ctx3.strokeRect(0,0,canvas3.width,canvas3.height);

            ctx3.translate((canvas3.width / 2), (canvas3.height / 2));
            ctx3.rotate(rotation);
            ctx3.drawImage(canvas2.canvas, -width / 2, -height / 2);
            canvas3.refresh();

            let canvas4 = scene.textures.createCanvas(canvasName + "y", rwidth, rheight);
            const ctx4 = canvas4.getContext('2d');
            ctx4.drawImage(canvas3.canvas, -(75 - (rwidth / 2)), -(75 - (rheight / 2)));
            canvas4.refresh();

            //scene.add.image((Math.floor(textureCount) * 130), 250, canvasName, "300x300").setOrigin(0, 0);
            //scene.add.image(100 + (Math.floor(textureCount) * 130), 250, canvasName + "tmp", "300x300").setOrigin(0, 0);
            //scene.add.image(100 + (Math.floor(textureCount) * 130), 350, canvasName + "x", "300x300").setOrigin(0, 0);

            return canvas3;
        } else {
            var x = "why?";
            return null;
        }
    }

    static calculateOutline(gameContext) {
        var accuracy = 0.3;
        marchingSquares.superData = gameContext.rtBalls.context.getImageData(0, 0, 1000, 1000).data; //canvas
        var contour = marchingSquares.march();
        contour = Utils.simplify(contour, 1 / accuracy);
        //gameContext.rtBalls.draw(gameContext.outline, contour);

        var points = contour.map((p) => {
            return { x: p[0], y: p[1] }
        });
        this.drawShape(gameContext.rtBalls.context, points);
    }

    static draw(outline, contour) {
        outline.lineStyle(5, 0x00ff00, 1.0);
        outline.beginPath();
        for (let i = 0; i < contour.length; i++) {
            outline.lineTo(contour[i][0], contour[i][1]);
        }

        outline.closePath();
        outline.strokePath();
    }

}
