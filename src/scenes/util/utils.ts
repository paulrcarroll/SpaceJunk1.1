import { Vertices } from 'matter';
import * as Phaser from 'phaser';
import { BaseScene } from '../base/baseScene';

export interface Vertex {
    x: number;
    y: number;
}

export interface Bounds {
    topLeft: Vertex;
    bottomRight: Vertex;
    width: number;
    height: number;
}

export class Utils {
    static textStyle = { font: "24px Arial", fill: "#aaffff", align: "center" };

    public static drawDebugText(scene: BaseScene, x: number, y: number, text) : Phaser.GameObjects.Text {
        var textObj = scene.add.text(x, y, text.toString(), this.textStyle);
        textObj.setDepth(1);
        return textObj;
    }

    public static drawDebugRectangle(scene: BaseScene, x: number, y: number, width: number, height: number, isFilled: boolean = false, strokeWidth = 4, strokeColor = 0x55ffaa, fillColor = 0x6666ff, alpha = 0.4) : Phaser.GameObjects.Rectangle {

        var rect = scene.add.rectangle(x, y, width, height, fillColor, alpha);
        rect.isFilled = isFilled;
        rect.setStrokeStyle(strokeWidth, strokeColor);

        return rect;
    }

    public static drawDebugPolygon(scene: BaseScene, x: number, y: number, verts: Vertex[], color, alpha: number = 0.5, bringToFront: boolean = true ) : Phaser.GameObjects.Polygon {
        var poly = scene.add.polygon(x, y, verts, color);
        poly.setStrokeStyle(4, color);
        poly.setAlpha(alpha);
        if (bringToFront) { poly.setDepth(1); }

        return poly;
    }

    public static  getBounds(points: Vertex[]) : Bounds {
        var minX = points[0].x;
        var minY = points[0].y;
        var maxX = points[0].x;
        var maxY = points[0].y;

        points.forEach(function(p) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        });

        return {
            topLeft: {x: minX, y: minY }, 
            bottomRight: { x: maxX, y: maxY},
            width: maxX - minX,
            height: maxY - minY
        };
    }

    public static rotate(cx, cy, x, y, angle) {
        var radians = angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return { x: nx, y: ny};
    }

    public static  rotateDeg(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return { x: nx, y: ny};
    }

    
////////////////////////////////douglas peucker algorithm adapted to [x,y]
//////////////////////////////// source: http://mourner.github.io/simplify-js/
    
// square distance between 2 points

public static getSqDist(p1, p2) {
    
    var dx = p1[0] - p2[0],
        dy = p1[1] - p2[1];
    
    return dx * dx + dy * dy;
}
    
// square distance from a point to a segment
public static getSqSegDist(p, p1, p2) {
    
        var x = p1[0],
            y = p1[1],
            dx = p2[0] - x,
            dy = p2[1] - y;
        
        if (dx !== 0 || dy !== 0) {
        
            var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        
            if (t > 1) {
                x = p2[0];
                y = p2[1];
        
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        
        dx = p[0] - x;
        dy = p[1] - y;
        
        return dx * dx + dy * dy;
}
    // rest of the code doesn't care about point format
    
    // basic distance-based simplification
    public static simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (this.getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}
    
public static step(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = this.getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) this.step(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) this.step(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
public static DouglasPeucker(points, sqTolerance) {
        var last = points.length - 1;
    
        var simplified = [points[0]];
        this.step(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);
    
        return simplified;
}
        
public static simplify(points, tolerance, highestQuality?) {
    
        if (points.length <= 2) return points;
    
        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    
        points = highestQuality ? points : this.simplifyRadialDist(points, sqTolerance);
        points = this.DouglasPeucker(points, sqTolerance);
    
        return points;
}
}