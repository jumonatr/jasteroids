/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿function Projection(min, max)
{
    this.Min = min;
    this.Max = max;
}

Projection.prototype.Overlaps = function(other)
{
    return  this.Min >= other.Min && this.Min <= other.Max ||	//this.Min is contained
            this.Max >= other.Min && this.Max <= other.Max;	//this.Max is contained
}

Projection.ProjectShape = function(axis, vectors)
{
    var min = Help.MAX_VALUE;
    var max = Help.MIN_VALUE;
    var normedAxis = (new Vector(axis)).GetNormalised();

    for(var i = 0; i < vectors.length; ++i)
    {
        var dot = vectors[i].Dot(normedAxis);
        min = Math.min(dot, min);
        max = Math.max(dot, max);
    }

    return new Projection(min, max);
}

//------------------------------------- Unit tests

function Test_ProjectionProjectShape()
{
    var axis = [1,0];
    var vectors = [
        new Vector([1, 30]),
        new Vector([-10, 4]),
        new Vector([4, -7])
    ];

    var projection = Projection.ProjectShape(axis, vectors);

    SimpleTest.Equals(-10, projection.Min);
    SimpleTest.Equals(4, projection.Max);
}

function Test_ProjectionOverlap()
{
    var axis = [1,0];
    var vectorsOne = [
        new Vector([1, 30]),
        new Vector([-10, 4]),
        new Vector([4, -7])
    ];

    //test with same volume
    var projectionOne = Projection.ProjectShape(axis, vectorsOne);
    var projectionTwo = Projection.ProjectShape(axis, vectorsOne);

    SimpleTest.Equals(true, projectionOne.Overlaps(projectionTwo));
    SimpleTest.Equals(true, projectionTwo.Overlaps(projectionOne));

    //test equal edges
    var vectorsTwo = [
        new Vector([6, 30]),
        new Vector([4, 4]),
        new Vector([10, -7])
    ];

    projectionTwo = Projection.ProjectShape(axis, vectorsTwo);
    SimpleTest.Equals(true, projectionOne.Overlaps(projectionTwo));
    SimpleTest.Equals(true, projectionTwo.Overlaps(projectionOne));

    //test not intersecting
    vectorsTwo = [
        new Vector([6, 30]),
        new Vector([6, 4]),
        new Vector([10, -7])
    ];

    projectionTwo = Projection.ProjectShape(axis, vectorsTwo);
    SimpleTest.Equals(false, projectionOne.Overlaps(projectionTwo));
    SimpleTest.Equals(false, projectionTwo.Overlaps(projectionOne));

    axis = [2, -1];
    vectorsOne = [
        new Vector([0, 0]),
        new Vector([2, 0]),
        new Vector([1, 2])
    ];
    vectorsTwo = [
        new Vector([0, 0.1]),
        new Vector([1, 2.1]),
        new Vector([0.5, 3])
    ];

    projectionOne = Projection.ProjectShape(axis, vectorsOne);
    projectionTwo = Projection.ProjectShape(axis, vectorsTwo);

    SimpleTest.Equals(false, projectionOne.Overlaps(projectionTwo));
    SimpleTest.Equals(false, projectionTwo.Overlaps(projectionOne));
}
