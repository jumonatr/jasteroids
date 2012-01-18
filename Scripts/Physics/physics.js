/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


Physics = {}

Physics.CirclesCollide = function( positionOne, radiusOne, positionTwo, radiusTwo )
{
    positionOne = positionOne instanceof Vector ? positionOne : new Vector(positionOne);

    var deltaPos = positionOne.Subtract(positionTwo);
    var sqrDistance = deltaPos.GetSquareLength();

    if ( Math.pow(radiusOne + radiusTwo, 2) >= sqrDistance )
        return true;

    return false;
}

//not precise, but works for visibility as will give false positives, but will never give false negatives
Physics.CircleInBox = function(position, radius, botLeft, topRight)
{
    return botLeft[0] - radius < position[0] && position[0] < topRight[0] + radius &&
            botLeft[1] - radius < position[1] && position[1] < topRight[1] + radius;
}

/** Ported to javascript by Julien Monat
* Computes the intersection between two lines. The calculated point is approximate,
 * since integers are used. If you need a more precise result, use doubles
 * everywhere.
 * (c) 2007 Alexander Hristov. Use Freely (LGPL license). http://www.ahristov.com
 *
* @param x1 Point 1 of Line 1
* @param y1 Point 1 of Line 1
* @param x2 Point 2 of Line 1
* @param y2 Point 2 of Line 1
* @param x3 Point 1 of Line 2
* @param y3 Point 1 of Line 2
* @param x4 Point 2 of Line 2
* @param y4 Point 2 of Line 2
* @return Point where the segments intersect, or null if they don't
*/
///########### THIS WORKS FOR LINES NOT LINE SEGMENTS
Physics.FindLineIntersection = function(x1,y1,x2,y2,x3,y3,x4,y4)
{
    var d = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
    if ( Math.abs(d) < 0.1 * Help.EPSILON) //parallel lines
        return undefined;

    var xi = ((x3-x4)*(x1*y2-y1*x2)-(x1-x2)*(x3*y4-y3*x4))/d;
    var yi = ((y3-y4)*(x1*y2-y1*x2)-(y1-y2)*(x3*y4-y3*x4))/d;

    return new Vector( [xi,yi] );
}

//polygon is an array of vectors
Physics.GetAxis = function(polygon)
{
    var axis = [];
    Help.CircularLoop(polygon, function(i, j)
    {
        var toI = polygon[j].Subtract(polygon[i]);
        axis.push(toI.Perpendicular().Normalise());
    });

    return axis;
}

Physics.ConvexeShapesCollide = function(one, two)
{
    var allAxis = Physics.GetAxis(one);
    Help.AddRange(allAxis, Physics.GetAxis(two));

    for(var i = 0; i < allAxis.length; ++i)
    {
        var projectionOne = Projection.ProjectShape(allAxis[i], one);
        var projectionTwo = Projection.ProjectShape(allAxis[i], two);

        if (!projectionOne.Overlaps(projectionTwo) && !projectionTwo.Overlaps(projectionOne))
            return false;
    }

    return true;
}

Physics.IsConvexe = function(vectorArray)
{
    var i = 0;
    var j = vectorArray.length - 1;
    var smallWay = undefined;
    for(; i < vectorArray.length - 1; j = i, i++)
    {
        var toI = vectorArray[i].Subtract(vectorArray[j]);
        var toIPlusOne = vectorArray[i + 1].Subtract(vectorArray[i]);

        var currentAngle = toI.RadiansBetween(toIPlusOne);
        if (currentAngle < 0)
            currentAngle += 2 * Math.PI;

        var isOnSmallWay = Math.abs(currentAngle) < Help.EPSILON ? smallWay : currentAngle < Math.PI;

        if (smallWay == undefined)
            smallWay = isOnSmallWay;

        if (smallWay == isOnSmallWay)
            continue;

        return false;
    }

    return true;
}

Physics.TransformShape = function(triangle, transform)
{
    var newTri = [];
    for(var i = 0; i < triangle.length; ++i)
    {
        var vector = triangle[i];
        var result = [0, 0, 0];
        mat4.multiplyVec3(transform, vector, result);
        newTri.push(new Vector(result));
    }

    return newTri;
}



// ----------------------------  Unit Tests

function Test_CirclesCollide()
{
    SimpleTest.Equals( true, Physics.CirclesCollide( [0, 0, 0], 1, [1, 0, 0], 0.5 ) );
    SimpleTest.Equals( true, Physics.CirclesCollide( [0, 0, 0], 0.5, [1, 0, 0], 0.5 ) );
    SimpleTest.Equals( true, Physics.CirclesCollide( [1, 0, 0], 0.5, [1, 0, 0], 0.5 ) );
    SimpleTest.Equals( true, Physics.CirclesCollide( [1, 0, 0], 1, [-2, 0, 0], 2 ) );
    SimpleTest.Equals( false, Physics.CirclesCollide( [1, 0, 0], 0.99, [-2, 0, 0], 2 ) );
}

function Test_PhysicsIsConvexe()
{
    function CheckConvexe(shape, value)
    {
        var vectors = Help.ConvertVertexBufferToVectorArray(shape, 2);
        SimpleTest.Equals(value, Physics.IsConvexe(vectors));

        vectors.reverse();
        SimpleTest.Equals(value, Physics.IsConvexe(vectors));
    }

    var shape = [
        1, 0,
        1, 1,
        -1, 1,
        -1, 0
    ];

    //test square in first two quadrants
    CheckConvexe(shape, true);

    shape = [
        1, 0,
        1, -1,
        -1, -1,
        -1, 0
    ];
    //check lower quadrants
    CheckConvexe(shape, true);

    shape = [
        1, 0,
        1, 1,
        -1, 0
    ];
    //check triangle
    CheckConvexe(shape, true);

    shape = [
        1, 0,
        1, 1,
        -1, 0,
        0, 0.5
    ];
    //check concave
    CheckConvexe(shape, false);

    shape = [
        0, 0,
        1, 1,
        2, 1,
        3, 1,
        2, 0,
        1, 0
    ];
    //check Paralelogram
    CheckConvexe(shape, true);

    shape =
    [
        0, 0,
        0, 2,
        1, 1,
        2, 2,
        2, 0
    ];
    CheckConvexe(shape, false);
}

function Test_PhysicsGetAxis()
{
    function TestShapeAxis(shape, axis)
    {
        var shapeVectors = Help.ConvertVertexBufferToVectorArray(shape, 2);
        var axisVectors = Help.ConvertVertexBufferToVectorArray(axis, 2);

        var foundAxis = Physics.GetAxis(shapeVectors);

        SimpleTest.Equals(axisVectors, foundAxis);
    }

    var shape =
    [
        0, 0,
        0, 1,
        1, 1,
        1, 0
    ]

    var axis =
    [
        0, -1,
        -1, 0,
        0, 1,
        1, 0
    ]

    TestShapeAxis(shape, axis);
}

function Test_FindLineIntersection()
{
    function TestIntersect(lines, value)
    {
        var intersection = Physics.FindLineIntersection(lines[0], lines[1], lines[2], lines[3], lines[4], lines[5], lines[6], lines[7]);
        SimpleTest.Equals(value, intersection != undefined);
        return intersection;
    }

    //Physics.FindLineIntersection = function(x1,y1,x2,y2,x3,y3,x4,y4)

    var lines =
    [
        0, 0,
        1, 1,
        1, 0,
        0, 1
    ];
    //check X shape
    var intersection = TestIntersect(lines, true);
    SimpleTest.Equals([0.5, 0.5, 0], intersection);

    lines =
    [
        0, 0,
        1, 1,
        0, 0,
        -1, 1
    ];

    //check touching lines
    intersection = TestIntersect(lines, true);
    SimpleTest.Equals([0, 0, 0], intersection);

    lines =
    [
        0, 0,
        0, 1,
        0, 1,
        1, 1
    ];

    //check L shape
    intersection = TestIntersect(lines, true);
    SimpleTest.Equals([0, 1, 0], intersection);

    lines =
    [
        0, 0,
        0, 1,
        1, 0,
        1, 1
    ];

    //check parallel
    TestIntersect(lines, false);
}


function Test_PhysicsConvexeShapesCollide()
{
    function TestIntersection(one, two, value)
    {
        var vectOne = Help.ConvertVertexBufferToVectorArray(one, 2);
        var vectTwo = Help.ConvertVertexBufferToVectorArray(two, 2);

        SimpleTest.Equals(value, Physics.ConvexeShapesCollide(vectOne, vectTwo));
    }

    var one =
    [
        0, 0,
        2, 0,
        1, 2
    ];

    var two =
    [
        1, 0,
        3, 0,
        2, 2
    ];

    TestIntersection(one, two, true);

    one =
    [
        0, 0,
        2, 0,
        1, 2
    ];

    two =
    [
        2, 0,
        4, 0,
        3, 2
    ];

    //test touching
    TestIntersection(one, two, true);


    one =
    [
        0, 0,
        2, 0,
        1, 2
    ];

    two =
    [
        3, 0,
        5, 0,
        6, 2
    ];

    //test to right
    TestIntersection(one, two, false);

    one =
    [
        0, 0,
        2, 0,
        1, 2
    ];

    two =
    [
        0, 0.1,
        1, 2.1,
        0.5, 3
    ];

    //near
    TestIntersection(one, two, false);
}

function Test_PhysicsTransformShape()
{
    function TestTransform(triangles, transform, desired)
    {
        var vectOne = Help.ConvertVertexBufferToVectorArray(triangles, 2);
        vectOne = Physics.TransformShape(vectOne, transform);
        var vectTwo = Help.ConvertVertexBufferToVectorArray(desired, 2);

        SimpleTest.Equals(vectTwo, vectOne);
    }

    var tri =
    [
       0, 0,
       2, 0,
       1, 1
    ]

    var desired =
    [
       1, 0,
       3, 0,
       2, 1
    ]

    var trans = mat4.create();
    mat4.identity(trans);
    mat4.translate(trans, [1, 0, 0]);

    TestTransform(tri, trans, desired);

    tri =
    [
       0, 0,
       2, 0,
       1, 1
    ]

    desired =
    [
       1, -1,
       3, -1,
       2, 0
    ]

    mat4.identity(trans);
    mat4.translate(trans, [1, -1, 0]);

    TestTransform(tri, trans, desired);

}










