import { Svg } from "matter-js";

export interface FrameSize {
  frameWidth: number;
  frameHeight: number;
}

export class SvgHelper {
  public static async getOutlineSync(path: string) {
    let self = this;
    let verts: any[];
    const data = await $.get(path);
    const gElem = await this.getGroupElem(data);

    await gElem.each(function (i, gElem: any) {
      var offSet = { x: 0, y: 0 };

      if (i == 0) {
        if (gElem.attributes["transform"]) {
          var tran = gElem.attributes["transform"].nodeValue;
          offSet = self.getTransform(tran);
        }

        let pv = $(data.documentElement)
          .find("path")
          .each(function (i, path) {
            if (i == 0) {
              var pVerts = Svg.pathToVertices(path, 40);

              const xScale = 3.78;
              const yScale = 3.78;

              pVerts.forEach(function (part, index) {
                pVerts[index].x += offSet.x;
                pVerts[index].y += offSet.y;

                pVerts[index].x *= xScale;
                pVerts[index].y *= yScale;
              }, pVerts); // use arr as this

              verts = pVerts;
            }
          });
      }
    });

    return verts;
  }

  private static async getGroupElem(data: any) {
    return await $(data.documentElement).find("g");
  }

  private static getTransform(transformString: string) {
    transformString = transformString
      .replace("translate(", "")
      .replace(")", "")
      .replace("mm", "");

    let vals: string[] = transformString.split(",");

    var tran = {
      x: parseInt(vals[0]),
      y: parseInt(vals[1]),
    };

    return tran;
  }
}
