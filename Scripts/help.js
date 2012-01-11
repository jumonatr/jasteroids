Help = {};

Help.MAX_VALUE = 999999999;
Help.MIN_VALUE = -Help.MAX_VALUE;
Help.EPSILON = 1e-10;

Help.Colors =
    {
        RED : [1, 0, 0, 1],
        GREEN : [0, 1, 0, 1],
        BLUE : [0, 0, 1, 1],
        WHITE : [1, 1, 1, 1],
        BLACK : [0, 0, 0, 1],
        YELLOW : [1, 1, 0, 1]
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

Number.prototype.clamp = function(min, max)
{
    return Math.max(min, Math.min(this, max));
}

//http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
Array.prototype.unique = function()
{
    var o = {}, i, l = this.length, r = [];
    for(i=0; i<l;i+=1) o[this[i]] = this[i];
    for(i in o) r.push(o[i]);
    return r;
}

Help.AddRange = function(array, toAdd)
{
    var len = toAdd.length;
    for(var i = 0; i < len; ++i)
        array.push(toAdd[i]);
}

Help.CircularLoop = function(array, func)
{
    var last = array.length - 1;
    var i = 0;
    var j = last;
    for(; i <= last; j = i, i++)
    {
        if (func(j, i) == true)
            break;
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

Help.ConvertVectorArrayToVertexBuffer = function(vecArr)
{
    var buffer = [];
    for(var i = 0; i < vecArr.length; ++i)
    {
        buffer.push(vecArr[i][0]);
        buffer.push(vecArr[i][1]);
        buffer.push(vecArr[i][2]);
    }
    
    return buffer;
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

//http://farseerphysics.codeplex.com/SourceControl/changeset/view/94324#1436511
Help.GetSignedArea = function(vectors)
{
    var area = 0.0;
    var len = vectors.length;
    for (var i = 0; i < len; i++)
    {
        var j = (i + 1) % len;
        area += vectors[i].X * vectors[j].Y;
        area -= vectors[i].Y * vectors[j].X;
    }
    return area / 2.0;
}

//http://stackoverflow.com/a/1295671
Help.CreateArray = function(len, val)
{
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}

//http://farseerphysics.codeplex.com/SourceControl/changeset/view/94324#1436511
Help.IsCounterClockWise = function(vectors)
{
    //We just return true for lines
    if (vectors.length < 3)
        return true;

    return Help.GetSignedArea(vectors) > 0.0;
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

function Test_CircularLoop()
{
    var iter = 0;
    var desired =
    [
        3, 0,
        0, 1,
        1, 2,
        2, 3
    ]
    
    var array = [0, 1, 2, 3];
    
    var func = function(i, j)
    {
        SimpleTest.Equals( i, desired[2 * iter] );
        SimpleTest.Equals( j, desired[2 * iter + 1] );
        iter++;
    }
    
    //Help.CirclularLoop = function(array, func)
    Help.CircularLoop(array, func);
    SimpleTest.Equals( 4, iter);
    
    iter = 0;
    var func = function(i, j)
    {
        iter++;
        return true; //break immediately
    }
    
    //Help.CirclularLoop = function(array, func)
    Help.CircularLoop(array, func);
    
    SimpleTest.Equals( 1, iter);
}

function Test_HelpAddRange()
{
    var one = [0, 1];
    var two = [2, 3];
    
    Help.AddRange(one, two);
    SimpleTest.Equals( [0, 1, 2, 3], one );
    
    one = [];
    two = [];
    
    Help.AddRange(one, two);
    SimpleTest.Equals( [], one );

    one = [1, 2];
    two = [];
    
    Help.AddRange(one, two);
    SimpleTest.Equals( [1, 2], one );

    one = [];
    two = [1, 2];
    
    Help.AddRange(one, two);
    SimpleTest.Equals( [1, 2], one );
}

function Test_ArrayUnique()
{
    var dupli = [ 1, 2, 2, 7, 7, 7, 1, 5 ];
    SimpleTest.Equals( [ 1, 2, 5, 7 ], dupli.unique());
}


function Test_IsCounterClockwise()
{
    function TestCounter(shape, value)
    {
        var vectorList = Help.ConvertVertexBufferToVectorArray(shape, 2);
        var received = Help.IsCounterClockWise(vectorList);
        SimpleTest.Equals( value, received );
    }
    
    var shape =
    [
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];
    
    TestCounter(shape, true);
    
    shape =
    [
        0, 0,
        0, 1,
        1, 1,
        1, 0
    ];
    
    TestCounter(shape, false);
}

function Test_NumberClamp()
{
    SimpleTest.Equals( 1, (10).clamp(0, 1) );
    SimpleTest.Equals( 0, (-1).clamp(0, 1) );
    SimpleTest.Equals( 0.5, (0.5).clamp(0, 1) );
}

