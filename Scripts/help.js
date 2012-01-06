Help = {};

Help.MAX_VALUE = 999999999;
Help.MIN_VALUE = -Help.MAX_VALUE;
Help.EPSILON = 0.00001;

Help.Colors =
    {
        RED : [1, 0, 0, 1],
        GREEN : [0, 1, 0, 1],
        BLUE : [0, 0, 1, 1],
        WHITE : [1, 1, 1, 1],
        BLACK : [0, 0, 0, 1]
    }

//http://strd6.com/2010/09/useful-javascript-game-extensions-numbersign-and-numberabs/
Number.prototype.sign = function() {
  if(this > 0) {
    return 1;
  } else if (this < 0) {
    return -1;
  } else {
    return 0;
  }
}

Help.ConvertVertexBufferToVectorArray = function(verticeBuffer, verticeSize)
{
    var vectorBuffer = [];
    var itemCount = verticeBuffer.length / verticeSize;
    for(var i = 0; i < itemCount; ++i)
    {
        var index = verticeSize * i;
        var end = verticeSize * (i + 1);
        var vector = new Vector(verticeBuffer.slice(index, end));
        vectorBuffer.push(vector);
    }
    
    return vectorBuffer;
}

Help.GetBufferBoundingRadius = function(vectors, vectorSize)
{
    var itemCount = vectors.length / vectorSize;
    var maxLen = 0;
    var maxVector;
    for(var i = 0; i < itemCount; ++i)
    {
        var vector = new Vector(vectors.slice(vectorSize * i, vectorSize * (i + 1)));
        var squareLen = vector.GetSquareLength();
        
        if (maxLen < squareLen)
        {
            maxLen = squareLen;
            maxVector = vector;
        }
    }
    
    if (!maxVector)
        throw new Error("Couldn't find a max vector with " + vectors + " and size " + vectorSize);
        
    return Math.sqrt(maxLen);
}

Help.DegToRad = function(degrees)
{
    return degrees * Math.PI / 180;
}

Help.Lerp = function(from, to, ratio)
{
    return from + ratio * (to - from);
}

Help.Center = function(vectorBuffer, vectorSize)
{
    if (vectorBuffer.length == 0)
        throw new Error("Can't find center of 0 vectors");
        
    if (vectorSize == 0)
        throw new Error("Can't have vectors of 0 size");
    
    if (vectorBuffer.length % vectorSize != 0)
        throw new Error("Bad Element Count Provided " + String(vectorSize));

    var center = [];
    var elementCount = vectorBuffer.length / vectorSize;
    
    for(var j = 0; j < vectorSize; ++j)
        center.push( vectorBuffer[j] );
    
    for(var i = 1; i < elementCount; ++i)
    {
        for(var j = 0; j < vectorSize; ++j)
            center[j] += vectorBuffer[i * vectorSize + j];
    }
    
    for(var j = 0; j < vectorSize; ++j)
        center[j] /= elementCount;
    
    return center;
}
    
//UNIT TESTS

function Test_Center()
{
    var vectorsToCenter =
    [
        0, 1, 0,
        0, -1, 0
    ]
    
    SimpleTest.Equals([0, 0, 0], Help.Center(vectorsToCenter, 3));
    
    vectorsToCenter =
    [
        0, 1, 0,
        0, -1, 0,
        1, 0, 0,
        -1, 0, 0,
        0, 0, 1
    ]
    
    SimpleTest.Equals([0, 0, 0.2], Help.Center(vectorsToCenter, 3));
    
    vectorsToCenter =
    [
        0, 1, 0,
        1, 0, 0,
        -1, 0, 0
    ]

    SimpleTest.Equals([0, 1.0/3.0, 0], Help.Center(vectorsToCenter, 3));
}

function Test_Lerp()
{
    SimpleTest.Equals(0, Help.Lerp(0, 1, 0));
    SimpleTest.Equals(1, Help.Lerp(0, 1, 1));
    SimpleTest.Equals(0.5, Help.Lerp(0, 1, 0.5));
    SimpleTest.Equals(-0.5, Help.Lerp(0, 1, -0.5));
    SimpleTest.Equals(1.5, Help.Lerp(0, 1, 1.5));
}

function Test_BoundingRadius()
{
    SimpleTest.Equals( 1, Help.GetBufferBoundingRadius([0, 1, 0, 1, 0, 0], 3) );
    SimpleTest.Equals( 1, Help.GetBufferBoundingRadius([0, 0, 0, 1, 0, 0], 3) );
    SimpleTest.Equals( 2, Help.GetBufferBoundingRadius([1, 1, 0, 1, 0, 0, 0, 0, 2], 3) );
    SimpleTest.Equals( 3, Help.GetBufferBoundingRadius([0, 0, 3, 1, 1, 1], 3) );
    SimpleTest.Equals( 1, Help.GetBufferBoundingRadius([0, -1, 0], 3) );
    SimpleTest.Equals( Math.sqrt(89), Help.GetBufferBoundingRadius([3, 1, 0, 5, -8, 0, 0, 0, 9], 3) );
}

