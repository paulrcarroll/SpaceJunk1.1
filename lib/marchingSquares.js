
//////////////////////////////// marching squares algorithm, modified version of d3 plugin.
//////////////////////////////// source: https://github.com/d3/d3-plugins/blob/master/geom/contour/contour.js

// License: https://github.com/d3/d3-plugins/blob/master/LICENSE
//
// Copyright (c) 2012-2014, Michael Bostock
// All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//* Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//* Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation
//  and/or other materials provided with the distribution.
//* The name Michael Bostock may not be used to endorse or promote products
//  derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 

marchingSquares = {
    superData : [],

    march : function(start) { 
    var grid =marchingSquares.getNonTransparent;
    var points = { 'x': [], 'y': [] };//empty data set(used in interpolation)
    
    var s = start || marchingSquares.getStartingPoint(grid), // starting point 
        c = [],    // contour polygon 
        x = s[0],  // current x position 
        y = s[1],  // current y position 
        dx = 0,    // next x direction 
        dy = 0,    // next y direction 
        pdx = NaN, // previous x direction 
        pdy = NaN, // previous y direction 
        i = 0; 

    do { 
    // determine marching squares index 
    i = 0; 
    if (grid(x-1, y-1)) i += 1; 
    if (grid(x,   y-1)) i += 2; 
    if (grid(x-1, y  )) i += 4; 
    if (grid(x,   y  )) i += 8; 

    // determine next direction 
    if (i === 6) { 
        dx = pdy === -1 ? -1 : 1; 
        dy = 0; 
    } else if (i === 9) { 
        dx = 0; 
        dy = pdx === 1 ? -1 : 1; 
    } else { 
        dx = marchingSquares.contourDx[i]; 
        dy = marchingSquares.contourDy[i]; 
    } 
    // update contour polygon 
    if (dx != pdx && dy != pdy) { 
        c.push([x, y]); 
        pdx = dx; 
        pdy = dy; 
    } 

    x += dx; 
    y += dy; 
    } while (s[0] != x || s[1] != y); 

    return c; 
},

    // lookup tables for marching directions 
    contourDx : [1, 0, 1, 1,-1, 0,-1, 1,0, 0,0,0,-1, 0,-1,NaN],
    contourDy : [0,-1, 0, 0, 0,-1, 0, 0,1,-1,1,1, 0,-1, 0,NaN],

    getStartingPoint : function(grid) { 
        var x = 0, 
            y = 0; 
        // search for a starting point; begin at origin 
        // and proceed along outward-expanding diagonals 
        while (true) { 
        if (grid(x,y)) { 
            console.log("found starting point at :" +x+" "+y);
            return [x,y];

        } 
        if (x === 0) { 
            x = y + 1; 
            y = 0; 
        } else { 
            x = x - 1; 
            y = y + 1; 
        }
        // if(x>game.config.width||y>game.config.height){break}; 

        if(x>1000||y>800){break}; 

        } 
    }, 

    //the alpha test
    getNonTransparent:function(x,y){  
        var a=marchingSquares.superData[(y*1000+x)*4+3];
        return(a>0);
    }   

}

////////////////////////////////douglas peucker algorithm adapted to [x,y]
//////////////////////////////// source: http://mourner.github.io/simplify-js/
    
// square distance between 2 points

function getSqDist(p1, p2) {
    
    var dx = p1[0] - p2[0],
        dy = p1[1] - p2[1];
    
    return dx * dx + dy * dy;
}
    
// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {
    
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
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}
    
function step(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) step(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) step(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function DouglasPeucker(points, sqTolerance) {
        var last = points.length - 1;
    
        var simplified = [points[0]];
        step(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);
    
        return simplified;
}
        
function simplify(points, tolerance, highestQuality) {
    
        if (points.length <= 2) return points;
    
        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    
        points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
        points = DouglasPeucker(points, sqTolerance);
    
        return points;
}