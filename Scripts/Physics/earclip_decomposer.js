/*
 * Javascript version ported by Julien Monat-Rodier 2012
 * C# Version Ported by Matt Bettcher and Ian Qvist 2009-2010
 * 
 * Original C++ Version Copyright (c) 2007 Eric Jordan
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

/// <summary>
/// Ported from jBox2D. Original author: ewjordan 
/// Triangulates a polygon using simple ear-clipping algorithm.
/// 
/// Only works on simple polygons.
/// 
/// Triangles may be degenerate, especially if you have identical points
/// in the input to the algorithm.  Check this before you use them.
/// </summary>
//box2D rev 32 - for details, see http://www.box2d.org/forum/viewtopic.php?f=4&t=83&start=50
function EarclipDecomposer()
{
    var Tol = .001;
    var MaxPolygonVertices = 20;
    
    this.ConvexPartitionFromBuffer = function(buffer, vertexSize)
    {
        var vertices = Help.ConvertVertexBufferToVectorArray(buffer, vertexSize);
        return this.ConvexPartition(vertices);
    }

    /// <summary>
    /// Decomposes a non-convex polygon into a number of convex polygons, up
    /// to maxPolys (remaining pieces are thrown out).
    /// Each resulting polygon will have no more than Settings.MaxPolygonVertices
    /// vertices.
    /// Warning: Only works on simple polygons
    /// </summary>
    /// <param name="vertices">The vertices.</param>
    /// <param name="maxPolys">The maximum number of polygons. default is huge</param>
    /// <param name="tolerance">The tolerance. default is 0</param>
    /// <returns></returns>
    this.ConvexPartition = function(vertices, maxPolys, tolerance)
    {
        if (vertices.length < 3)
            return [ vertices.slice(0) ];
            
        if (maxPolys == undefined)
            maxPolys = 1e10;
            
        if (tolerance == undefined)
            tolerance = 0;

        if (Physics.IsConvexe(vertices) && vertices.length <= MaxPolygonVertices)
        {
            if (Help.IsCounterClockWise(vertices))
            {
                var tempP = vertices.slice(0);
                tempP.reverse();
                //TODO Colinear Simplify
                //tempP = SimplifyTools.CollinearSimplify(tempP);
                return [ tempP ];
            }
            //TODO Colinear Simplify
            //vertices = SimplifyTools.CollinearSimplify(vertices);
            //vertices.ForceCounterClockWise();
            return [ vertices.slice(0) ];
        }

        var triangulated;

        if (Help.IsCounterClockWise(vertices))
        {
            var tempP = vertices.slice(0);
            tempP.reverse();
            triangulated = this.TriangulatePolygon(tempP);
        }
        else
        {
            triangulated = this.TriangulatePolygon(vertices);
        }
        
        if (triangulated.length < 1)
        {
            //Still no luck?  Oh well...
            throw new Error("Can't triangulate your polygon.");
        }

        var polygonizedTriangles = this.PolygonizeTriangles(triangulated, maxPolys, tolerance);

        //The polygonized triangles are not guaranteed to be without collinear points. We remove
        //them to be sure.
        //TODO Colinear Simplify
        /*
        for (var i = 0; i < polygonizedTriangles.length; i++)
        {
            polygonizedTriangles[i] = SimplifyTools.CollinearSimplify(polygonizedTriangles[i], 0);
        }
        */

        //Remove empty vertice collections
        for (var i = polygonizedTriangles.length - 1; i >= 0; i--)
        {
            if (polygonizedTriangles[i].length == 0)
                polygonizedTriangles.splice(i, 1);
        }

        return polygonizedTriangles;
    }

    /// <summary>
    /// Turns a list of triangles into a list of convex polygons. Very simple
    /// method - start with a seed triangle, keep adding triangles to it until
    /// you can't add any more without making the polygon non-convex.
    ///
    /// Returns an integer telling how many polygons were created.  Will fill
    /// polys array up to polysLength entries, which may be smaller or larger
    /// than the return value.
    /// 
    /// Takes O(N///P) where P is the number of resultant polygons, N is triangle
    /// count.
    /// 
    /// The final polygon list will not necessarily be minimal, though in
    /// practice it works fairly well.
    /// </summary>
    /// <param name="triangulated">The triangulated.</param>
    ///<param name="maxPolys">The maximun number of polygons</param>
    ///<param name="tolerance">The tolerance</param>
    ///<returns></returns>
    this.PolygonizeTriangles = function(triangulated, maxPolys, tolerance)
    {
        var polys = [];

        var polyIndex = 0;

        if (triangulated.length <= 0)
        {
            //return empty polygon list
            return polys;
        }
        var covered = new Array(triangulated.length);
        for (var i = 0; i < triangulated.length; ++i)
        {
            covered[i] = false;

            //Check here for degenerate triangles
            if (((triangulated[i].X[0] == triangulated[i].X[1]) && (triangulated[i].Y[0] == triangulated[i].Y[1]))
                ||
                ((triangulated[i].X[1] == triangulated[i].X[2]) && (triangulated[i].Y[1] == triangulated[i].Y[2]))
                ||
                ((triangulated[i].X[0] == triangulated[i].X[2]) && (triangulated[i].Y[0] == triangulated[i].Y[2])))
            {
                covered[i] = true;
            }
        }

        var notDone = true;
        while (notDone)
        {
            var currTri = -1;
            for (var i = 0; i < triangulated.length; ++i)
            {
                if (covered[i])
                    continue;
                currTri = i;
                break;
            }
            if (currTri == -1)
            {
                notDone = false;
            }
            else
            {
                var poly = [];

                for (var i = 0; i < 3; i++)
                {
                    poly.push( new Vector(triangulated[currTri].X[i], triangulated[currTri].Y[i]) );
                }

                covered[currTri] = true;
                var index = 0;
                for (var i = 0; i < 2 * triangulated.length; ++i, ++index)
                {
                    while (index >= triangulated.length) index -= triangulated.length;
                    if (covered[index])
                    {
                        continue;
                    }
                    
                    //creates array of vectors
                    var newP = AddTriangle(triangulated[index], poly);
                    if (newP == null)
                        continue; // is this right

                    if (newP.length > MaxPolygonVertices)
                        continue;

                    if (Physics.IsConvexe(newP))
                    {
                        //Or should it be IsUsable?  Maybe re-write IsConvex to apply the angle threshold from Box2d
                        poly = newP.slice(0);
                        covered[index] = true;
                    }
                }

                //We have a maximum of polygons that we need to keep under.
                if (polyIndex < maxPolys)
                {
                    //SimplifyTools.MergeParallelEdges(poly, tolerance);

                    //If identical points are present, a triangle gets
                    //borked by the MergeParallelEdges function, hence
                    //the vertex number check
                    if (poly.length >= 3)
                        polys.push(poly.slice(0));
                    //else
                    //    printf("Skipping corrupt poly\n");
                }
                if (poly.length >= 3)
                    polyIndex++; //Must be outside (polyIndex < polysLength) test
            }
        }

        return polys;
    }

    /// <summary>
    /// Triangulates a polygon using simple ear-clipping algorithm. Returns
    /// size of Triangle array unless the polygon can't be triangulated.
    /// This should only happen if the polygon self-intersects,
    /// though it will not _always_ return null for a bad polygon - it is the
    /// caller's responsibility to check for self-intersection, and if it
    /// doesn't, it should at least check that the return value is non-null
    /// before using. You're warned!
    ///
    /// Triangles may be degenerate, especially if you have identical points
    /// in the input to the algorithm.  Check this before you use them.
    ///
    /// This is totally unoptimized, so for large polygons it should not be part
    /// of the simulation loop.
    ///
    /// Warning: Only works on simple polygons.
    /// </summary>
    /// <returns></returns>
    this.TriangulatePolygon = function(vertices)
    {
        var results = [];
        if (vertices.length < 3)
            return results;

        //Recurse and split on pinch points
        var pA, pB;
        var pin = vertices.slice(0);
        if (ResolvePinchPoint(pin, pA, pB))
        {
            var mergeA = this.TriangulatePolygon(pA);
            var mergeB = this.TriangulatePolygon(pB);

            if (mergeA == undefined || mergeB == undefined)
                throw new Error("Can't triangulate your polygon.");

            for (var i = 0; i < mergeA.length; ++i)
            {
                results.push(new Triangle(mergeA[i]));
            }
            for (var i = 0; i < mergeB.length; ++i)
            {
                results.push(new Triangle(mergeB[i]));
            }

            return results;
        }

        var buffer = new Array(vertices.length - 2);
        var bufferSize = 0;
        var xrem = new Array(vertices.length);
        var yrem = new Array(vertices.length);
        for (var i = 0; i < vertices.length; ++i)
        {
            xrem[i] = vertices[i].X;
            yrem[i] = vertices[i].Y;
        }

        var vNum = vertices.length;

        while (vNum > 3)
        {
            // Find an ear
            var earIndex = -1;
            var earMaxMinCross = -10.0;
            for (var i = 0; i < vNum; ++i)
            {
                if (IsEar(i, xrem, yrem, vNum))
                {
                    var lower = Remainder(i - 1, vNum);
                    var upper = Remainder(i + 1, vNum);
                    var d1 = new Vector(xrem[upper] - xrem[i], yrem[upper] - yrem[i]);
                    var d2 = new Vector(xrem[i] - xrem[lower], yrem[i] - yrem[lower]);
                    var d3 = new Vector(xrem[lower] - xrem[upper], yrem[lower] - yrem[upper]);

                    d1.Normalise();
                    d2.Normalise();
                    d3.Normalise();
                    var cross12 = d1.Cross2(d2);
                    cross12 = Math.abs(cross12);

                    var cross23 = d2.Cross2(d3);
                    cross23 = Math.abs(cross23);

                    var cross31 = d3.Cross2(d1);
                    cross31 = Math.abs(cross31);

                    //Find the maximum minimum angle
                    var minCross = Math.min(cross12, Math.min(cross23, cross31));
                    if (minCross > earMaxMinCross)
                    {
                        earIndex = i;
                        earMaxMinCross = minCross;
                    }
                }
            }

            // If we still haven't found an ear, we're screwed.
            // Note: sometimes this is happening because the
            // remaining points are collinear.  Really these
            // should just be thrown out without halting triangulation.
            if (earIndex == -1)
            {
                throw new Error("I'm pretty sure they're using an unititialised buffer here...");
                for (var i = 0; i < bufferSize; i++)
                {
                    results.push(new Triangle(buffer[i]));
                }

                return results;
            }

            // Clip off the ear:
            // - remove the ear tip from the list

            --vNum;
            var newx = new Array(vNum);
            var newy = new Array(vNum);
            var currDest = 0;
            for (var i = 0; i < vNum; ++i)
            {
                if (currDest == earIndex) ++currDest;
                newx[i] = xrem[currDest];
                newy[i] = yrem[currDest];
                ++currDest;
            }

            // - add the clipped triangle to the triangle list
            var under = (earIndex == 0) ? (vNum) : (earIndex - 1);
            var over = (earIndex == vNum) ? 0 : (earIndex + 1);
            var toAdd = new Triangle(xrem[earIndex], yrem[earIndex], xrem[over], yrem[over], xrem[under],
                                          yrem[under]);
            buffer[bufferSize] = toAdd;
            ++bufferSize;

            // - replace the old list with the new one
            xrem = newx;
            yrem = newy;
        }

        var tooAdd = new Triangle(xrem[1], yrem[1], xrem[2], yrem[2], xrem[0], yrem[0]);
        buffer[bufferSize] = tooAdd;
        ++bufferSize;

        for (var i = 0; i < bufferSize; i++)
        {
            results.push(new Triangle(buffer[i]));
        }

        return results;
    }

    /// <summary>
    /// Finds and fixes "pinch points," points where two polygon
    /// vertices are at the same point.
    /// 
    /// If a pinch point is found, pin is broken up into poutA and poutB
    /// and true is returned; otherwise, returns false.
    /// 
    /// Mostly for internal use.
    /// 
    /// O(N^2) time, which sucks...
    /// </summary>
    /// <param name="pin">The pin.</param>
    /// <param name="poutA">The pout A.</param>
    /// <param name="poutB">The pout B.</param>
    /// <returns></returns>
    function ResolvePinchPoint(pin, poutA, poutB)
    {
        poutA = [];
        poutB = [];

        if (pin.length < 3)
            return false;

        var hasPinchPoint = false;
        var pinchIndexA = -1;
        var pinchIndexB = -1;
        for (var i = 0; i < pin.length; ++i)
        {
            for (var j = i + 1; j < pin.length; ++j)
            {
                //Don't worry about pinch points where the points
                //are actually just dupe neighbors
                if (Math.abs(pin[i].X - pin[j].X) < Tol && Math.abs(pin[i].Y - pin[j].Y) < Tol && j != i + 1)
                {
                    pinchIndexA = i;
                    pinchIndexB = j;
                    hasPinchPoint = true;
                    break;
                }
            }
            if (hasPinchPoint) break;
        }
        if (hasPinchPoint)
        {
            var sizeA = pinchIndexB - pinchIndexA;
            if (sizeA == pin.length) return false; //has dupe points at wraparound, not a problem here
            for (var i = 0; i < sizeA; ++i)
            {
                var ind = Remainder(pinchIndexA + i, pin.length); // is this right
                poutA.push(pin[ind]);
            }

            var sizeB = pin.length - sizeA;
            for (var i = 0; i < sizeB; ++i)
            {
                var ind = Remainder(pinchIndexB + i, pin.length); // is this right    
                poutB.push(pin[ind]);
            }
        }
        return hasPinchPoint;
    }

    /// <summary>
    /// Fix for obnoxious behavior for the % operator for negative numbers...
    /// </summary>
    /// <param name="x">The x.</param>
    /// <param name="modulus">The modulus.</param>
    /// <returns></returns>
    function Remainder(x, modulus)
    {
        var rem = x % modulus;
        while (rem < 0)
        {
            rem += modulus;
        }
        return rem;
    }
    
    function AddTriangle(t, vertices)
    {
        // First, find vertices that connect
        var firstP = -1;
        var firstT = -1;
        var secondP = -1;
        var secondT = -1;
        for (var i = 0; i < vertices.length; i++)
        {
            if (t.X[0] == vertices[i].X && t.Y[0] == vertices[i].Y)
            {
                if (firstP == -1)
                {
                    firstP = i;
                    firstT = 0;
                }
                else
                {
                    secondP = i;
                    secondT = 0;
                }
            }
            else if (t.X[1] == vertices[i].X && t.Y[1] == vertices[i].Y)
            {
                if (firstP == -1)
                {
                    firstP = i;
                    firstT = 1;
                }
                else
                {
                    secondP = i;
                    secondT = 1;
                }
            }
            else if (t.X[2] == vertices[i].X && t.Y[2] == vertices[i].Y)
            {
                if (firstP == -1)
                {
                    firstP = i;
                    firstT = 2;
                }
                else
                {
                    secondP = i;
                    secondT = 2;
                }
            }
        }
        // Fix ordering if first should be last vertex of poly
        if (firstP == 0 && secondP == vertices.length - 1)
        {
            firstP = vertices.length - 1;
            secondP = 0;
        }

        // Didn't find it
        if (secondP == -1)
        {
            return null;
        }

        // Find tip index on triangle
        var tipT = 0;
        if (tipT == firstT || tipT == secondT)
            tipT = 1;
        if (tipT == firstT || tipT == secondT)
            tipT = 2;

        var result = [];
        for (var i = 0; i < vertices.length; i++)
        {
            result.push(vertices[i]);

            if (i == firstP)
                result.push(new Vector(t.X[tipT], t.Y[tipT]));
        }

        return result;
    }

    /// <summary>
    /// Checks if vertex i is the tip of an ear in polygon defined by xv[] and
    /// yv[].
    ///
    /// Assumes clockwise orientation of polygon...ick
    /// </summary>
    /// <param name="i">The i.</param>
    /// <param name="xv">The xv.</param>
    /// <param name="yv">The yv.</param>
    /// <param name="xvLength">Length of the xv.</param>
    /// <returns>
    /// 	<c>true</c> if the specified i is ear; otherwise, <c>false</c>.
    /// </returns>
    function IsEar(i, xv, yv, xvLength)
    {
        var dx0, dy0, dx1, dy1;
        if (i >= xvLength || i < 0 || xvLength < 3)
        {
            return false;
        }
        var upper = i + 1;
        var lower = i - 1;
        if (i == 0)
        {
            dx0 = xv[0] - xv[xvLength - 1];
            dy0 = yv[0] - yv[xvLength - 1];
            dx1 = xv[1] - xv[0];
            dy1 = yv[1] - yv[0];
            lower = xvLength - 1;
        }
        else if (i == xvLength - 1)
        {
            dx0 = xv[i] - xv[i - 1];
            dy0 = yv[i] - yv[i - 1];
            dx1 = xv[0] - xv[i];
            dy1 = yv[0] - yv[i];
            upper = 0;
        }
        else
        {
            dx0 = xv[i] - xv[i - 1];
            dy0 = yv[i] - yv[i - 1];
            dx1 = xv[i + 1] - xv[i];
            dy1 = yv[i + 1] - yv[i];
        }
        var cross = dx0 * dy1 - dx1 * dy0;
        if (cross > 0)
            return false;
        var myTri = new Triangle(xv[i], yv[i], xv[upper], yv[upper], xv[lower], yv[lower]);
        for (var j = 0; j < xvLength; ++j)
        {
            if (j == i || j == lower || j == upper)
                continue;
            if (myTri.IsInside(xv[j], yv[j]))
                return false;
        }
        return true;
    }
    
    //Constructor automatically fixes orientation to ccw
    function Triangle(x1, y1, x2, y2, x3, y3)
    {
        this.X = [0.0, 0.0, 0.0];
        this.Y = [0.0, 0.0, 0.0];
        
        if (x1 instanceof Triangle)
        {
            this.X[0] = x1.X[0];
            this.X[1] = x1.X[1];
            this.X[2] = x1.X[2];
            this.Y[0] = x1.Y[0];
            this.Y[1] = x1.Y[1];
            this.Y[2] = x1.Y[2];
        }
        else
        {
            var dx1 = x2 - x1;
            var dx2 = x3 - x1;
            var dy1 = y2 - y1;
            var dy2 = y3 - y1;
            var cross = dx1 * dy2 - dx2 * dy1;
            var ccw = (cross > 0);
            if (ccw)
            {
                this.X[0] = x1;
                this.X[1] = x2;
                this.X[2] = x3;
                this.Y[0] = y1;
                this.Y[1] = y2;
                this.Y[2] = y3;
            }
            else
            {
                this.X[0] = x1;
                this.X[1] = x3;
                this.X[2] = x2;
                this.Y[0] = y1;
                this.Y[1] = y3;
                this.Y[2] = y2;
            }
        }
        
        this.IsInside = function(x, y)
        {
            if (x < this.X[0] && x < this.X[1] && x < this.X[2]) return false;
            if (x > this.X[0] && x > this.X[1] && x > this.X[2]) return false;
            if (y < this.Y[0] && y < this.Y[1] && y < this.Y[2]) return false;
            if (y > this.Y[0] && y > this.Y[1] && y > this.Y[2]) return false;

            var vx2 = x - this.X[0];
            var vy2 = y - this.Y[0];
            var vx1 = this.X[1] - this.X[0];
            var vy1 = this.Y[1] - this.Y[0];
            var vx0 = this.X[2] - this.X[0];
            var vy0 = this.Y[2] - this.Y[0];

            var dot00 = vx0 * vx0 + vy0 * vy0;
            var dot01 = vx0 * vx1 + vy0 * vy1;
            var dot02 = vx0 * vx2 + vy0 * vy2;
            var dot11 = vx1 * vx1 + vy1 * vy1;
            var dot12 = vx1 * vx2 + vy1 * vy2;
            var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
            var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
            var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

            return ((u > 0) && (v > 0) && (u + v < 1));
        }
    }
}


function Test_EarclipDecomposer1()
{
    function TestDecompose(shape, desired)
    {
        var vectorShape = Help.ConvertVertexBufferToVectorArray(shape, 2);
        var desiredShapes = [];
        for(var i = 0; i < desired.length; ++i)
        {
            desiredShapes.push(Help.ConvertVertexBufferToVectorArray(desired[i], 2));
        }
        
        var simplified = (new EarclipDecomposer()).ConvexPartition(vectorShape);
        
        SimpleTest.Equals(desiredShapes, simplified);
    }
    
    var shape =
    [
        0, 1,
        1, 1,
        1, 0,
        0, 0
    ];
    
    var desired = [ shape.slice(0) ];
    
    TestDecompose(shape, desired);

    shape =
    [
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];
    
    TestDecompose(shape, desired);
    
    shape =
    [
        0, 0,
        0, 2,
        1, 1,
        2, 2,
        2, 0
    ];
    
    desired =
    [
        [
            0, 0,
            2, 0,
            1, 1,
            0, 2
        ],
        [
            2, 2,
            1, 1,
            2, 0
        ]
    ];
    
    TestDecompose(shape, desired);
}
