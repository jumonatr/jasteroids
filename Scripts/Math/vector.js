/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿
function Vector(a, b, c)
{
    var x, y, z;
    if (a instanceof Array)
    {
        x = a[0];
        y = a[1];
        z = a[2];
    }
    else
    {
        x = a;
        y = b;
        z = c;
    }

    this[0] = x || 0;
    this[1] = y || 0;
    this[2] = z || 0;

    this.length = 3;
}

Vector.prototype = new Array;

Vector.UNIT_X = new Vector([1, 0, 0]);
Vector.UNIT_Y = new Vector([0, 1, 0]);
Vector.UNIT_Z = new Vector([0, 0, 1]);
Vector.ZERO = new Vector([0, 0, 0]);

Vector.prototype.__defineGetter__("X", function() { return this[0]; });
Vector.prototype.__defineSetter__("X", function(value)
{
    return this[0] = value;
});

Vector.prototype.__defineGetter__("Y", function() { return this[1]; });
Vector.prototype.__defineSetter__("Y", function(value)
{
    return this[1] = value;
});

Vector.prototype.__defineGetter__("Z", function() { return this[2]; });
Vector.prototype.__defineSetter__("Z", function(value)
{
    return this[2] = value;
});


Vector.prototype.Normalise = function()
{
    var len = this.GetLength();
    if (len == 0)
    {
        console.error("Tried normalising vector of 0 length");
        return;
    }
    len = 1 / len;
    this[0] *= len;
    this[1] *= len;
    this[2] *= len;
    return this;
}

Vector.prototype.GetNormalised = function()
{
    var vec = new Vector(this);
    return vec.Normalise();
}

Vector.prototype.GetSquareLength = function()
{
    return Math.pow( this[0], 2 ) + Math.pow( this[1], 2 ) + Math.pow( this[2], 2 );
}

Vector.prototype.GetLength = function()
{
    return Math.sqrt(this.GetSquareLength());
}

Vector.prototype.Transform = function(func)
{
    this[0] = func(0, this[0]);
    this[1] = func(1, this[1]);
    this[2] = func(2, this[2]);

    return this;
}

Vector.prototype.Add = function(other)
{
    var result = new Vector(this);
    return result.Transform(function(i, val) { return val + (other[i] || 0); });
}

Vector.prototype.Subtract = function(other)
{
    var result = new Vector(this);
    return result.Transform(function(i, val) { return val - (other[i] || 0); });
}

Vector.prototype.Multiply = function(other)
{
    var result = new Vector(this);
    var operand = typeof other == "number" ? [other, other, other] : other;
    return result.Transform(function(i, val) { return val * (operand[i] || 1); });
}

Vector.prototype.MatMultiply = function(matrix)
{
    var result = [0,0,0];
    mat4.multiplyVec3(matrix, this, result);
    return new Vector(result);
}

Vector.prototype.RadiansBetween = function(other)
{
    var thisNormed = this.GetNormalised();
    var otherNormed = other.GetNormalised();

    //http://www.gamedev.net/topic/487576-angle-between-two-lines-clockwise/ but in counter clockwise order and in radians
    return Math.atan2(thisNormed[0] * otherNormed[1] - thisNormed[1] * otherNormed[0], thisNormed[0] * otherNormed[0] + thisNormed[1] * otherNormed[1]);
}

Vector.prototype.Dot = function(other)
{
    return this[0] * other[0] + this[1] * other[1] + this[2] * (other[2] || 1);
}

Vector.prototype.Cross3 = function(other)
{
    return new Vector(  this[1] * (other[2] || 1) - this[2] * other[1],
                        this[2] * other[0] - this[0] * (other[2] || 1),
                        this[0] * other[1] - this[1] * other[0]);
}

Vector.prototype.Cross2 = function(other)
{
    return this[0] * other[1] - this[1] * other[0];
}


Vector.prototype.Rotate = function(radians)
{
    var result = new Vector(this);
    result[0] = this[0] * Math.cos(radians) - this[1] * Math.sin(radians);
    result[1] = this[0] * Math.sin(radians) + this[1] * Math.cos(radians);
    return result;
}

Vector.prototype.Perpendicular = function()
{
    return new Vector(-this[1], this[0]);
}

Vector.prototype.Clamp = function(len)
{
    var squareLen = this.GetSquareLength();
    var result = new Vector(this);

    if (squareLen < len * len)
        return result; //no change

    var ratio = len / Math.sqrt(squareLen);
    return result.Transform(function(i, val) { return val * ratio; });
}

//Overriden methods

Vector.prototype.toString = function()
{
    return this[0] + ", " + this[1] + ", " + this[2];
}


//------------------------------------- Unit tests
function Test_VectorGetSet()
{
    var vect = new Vector(10, 5);
    SimpleTest.Equals(10, vect[0]);
    SimpleTest.Equals(5, vect[1]);
    SimpleTest.Equals(0, vect[2]);
    SimpleTest.Equals(10, vect.X);
    SimpleTest.Equals(5, vect.Y);
    SimpleTest.Equals(0, vect.Z);
}

function Test_VectorInheritance()
{
    var vect = new Vector(10, 0);
    SimpleTest.Equals(true, vect instanceof Array);
}

function Test_VectorConstructor()
{
    var vect = new Vector(1, 0, 0);
    SimpleTest.Equals([1, 0, 0], vect);

    vect = new Vector( [1, 0, 0] );
    SimpleTest.Equals([1, 0, 0], vect);

    vect = new Vector( [1, 0] );
    SimpleTest.Equals([1, 0, 0], vect);

    vect = new Vector();
    SimpleTest.Equals([0, 0, 0], vect);
}

function Test_VectorLength()
{
    var vect = new Vector(1, 0);
    vect.Normalise();
    SimpleTest.Equals([1, 0, 0], vect);
}

function Test_VectorAdd()
{
    var one = new Vector(1, 0);
    var two = new Vector(-1, 1);

    SimpleTest.Equals([0, 1, 0], one.Add(two));

    one = new Vector(0, -50);
    two = new Vector(-1, 1);

    SimpleTest.Equals([-1, -49, 0], one.Add(two));
}

function Test_VectorSubtract()
{
    var one = new Vector(1, 0);
    var two = new Vector(-1, 1);

    SimpleTest.Equals([2, -1, 0], one.Subtract(two));

    one = new Vector(0, -50);
    two = new Vector(-1, 1);

    SimpleTest.Equals([1, -51, 0], one.Subtract(two));
}

function Test_VectorMultiply()
{
    var one = new Vector(1, 0);
    var two = new Vector(-1, 1);

    SimpleTest.Equals([-1, 0, 0], one.Multiply(two));

    one = new Vector(0, -50);
    two = new Vector(-1, 1);

    SimpleTest.Equals([0, -50, 0], one.Multiply(two));

    one = new Vector(2, 3);
    two = new Vector(4, 5);

    SimpleTest.Equals([8, 15, 0], one.Multiply(two));

    SimpleTest.Equals([-2, -3, 0], one.Multiply(-1));
}

function Test_VectorRads()
{
    var one = new Vector(1, 0);
    var two = new Vector(0, 1);

    SimpleTest.Equals(Math.PI / 2, one.RadiansBetween(two));

    one = new Vector(0, -1);
    two = new Vector(1, 0);

    SimpleTest.Equals(Math.PI / 2, one.RadiansBetween(two));

    one = new Vector(2, 2);
    two = new Vector(-2, -2);

    SimpleTest.Equals(Math.PI, one.RadiansBetween(two));
}

function Test_VectorRotate()
{
    var one = new Vector(1, 0);
    var two = new Vector(0, 1);

    SimpleTest.Equals(two, one.Rotate(Math.PI / 2));

    one = new Vector(0, -1);
    two = new Vector(1, 0);

    SimpleTest.Equals(two, one.Rotate(Math.PI / 2));

    one = new Vector(2, 2);
    two = new Vector(-2, -2);

    SimpleTest.Equals(two, one.Rotate(-Math.PI));
}

function Test_VectorRotateAndRads()
{
    var angle = Math.PI / 2;
    var one = new Vector(5, 0);
    var two = one.Rotate(angle);

    SimpleTest.Equals(angle, one.RadiansBetween(two));

    angle = 0.1 * Math.PI;
    two = one.Rotate(angle);

    SimpleTest.Equals(angle, one.RadiansBetween(two));

    angle = -Math.PI;
    two = one.Rotate(angle);

    SimpleTest.Equals(angle, one.RadiansBetween(two));
}

function Test_VectorClamp()
{
    var one = new Vector(9, 0);
    SimpleTest.Equals([9,0,0], one.Clamp(10));

    one = new Vector(5, 0);
    SimpleTest.Equals([1,0,0], one.Clamp(1));
}

function Test_VectorMatrix()
{
    var one = new Vector(10, 0);
    var mat = mat4.create();
    mat4.identity(mat);

    SimpleTest.Equals([10,0,0], one.MatMultiply(mat));

    mat4.translate(mat, [-10, 0, 0]);
    SimpleTest.Equals([0,0,0], one.MatMultiply(mat));

    mat4.identity(mat);
    mat4.rotate(mat, Math.PI / 2, Vector.UNIT_Z);
    SimpleTest.Equals([0,10,0], one.MatMultiply(mat));
}


