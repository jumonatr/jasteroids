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

Physics.ConvexePolygonsCollide = function(one, two)
{
    
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
        var isOnSmallWay = currentAngle < Math.PI;
        
        if (smallWay == undefined)
            smallWay = isOnSmallWay;
            
        if (smallWay == isOnSmallWay)
            continue;
             
        return false;
    }
    
    return true;
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

}