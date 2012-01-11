
function CreateAsteroid(max_size, min_size)
{
    var vertices = CreateAsteroidVerts(20, 6, max_size, min_size);
    //var vertices = CreateAsteroidVerts(6, 6, 250, 250);
    var lineBuffer = new LineLoop(3, vertices);

    return new Asteroid(lineBuffer);
}

Asteroid.prototype = new GameObject();
Asteroid.prototype.Update = GameObject.prototype.UpdateMouvement;

function Asteroid(lineBuffer, position, angle)
{    
    //init
    if (position)
        this.Position = position;
        
    if (angle)
        this.Angle = angle;
    
    this.LineBuffer = lineBuffer;
    this.CreationTime = (new Date()).getTime();
    this.Color = Help.Colors.WHITE;       
}

Asteroid.prototype.IsVisible = function(lowerLeft, topRight)
{
    return Physics.CircleInBox(this.Position, this.LineBuffer.BoundingRadius, lowerLeft, topRight);
}

Asteroid.prototype.Draw = function(program)
{
    var transform = this.GetTransform();

    program.SetWorld(transform);        
    this.LineBuffer.Draw(program, this.Color);
}

Asteroid.prototype.GetTransform = function()
{
    var transform = mat4.create();
    mat4.identity(transform);
    mat4.translate(transform, this.Position);
    mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
    
    return transform;
}

Asteroid.prototype.ContainsPoint = function(point)
{
    return this.LineBuffer.ContainsPoint(point, this.GetTransform());
}

Asteroid.prototype.CollidesWith = function(other)
{
    var now = new Date().getTime();
    var dt = (now - this.CreationTime) / 1000.0;
    if (dt < 0.2)
        return false;

    if ( !this.LineBuffer.CrudeCollidesWith(this.Position, other.LineBuffer, other.Position) )
        return false;

    return this.LineBuffer.CollidesWith(this.GetTransform(), other.LineBuffer, other.GetTransform());
}

Asteroid.prototype.BreakInTwo = function()
{
    var childLineBuffers = this.LineBuffer.SplitInTwo();
    if (!childLineBuffers)
        return BreakIntoLines(this);
        
    var children = [ new Asteroid(childLineBuffers[0], this.Position, this.Angle), new Asteroid(childLineBuffers[1], this.Position, this.Angle) ];
    var transform = this.GetTransform();
    
    var centerOne = Help.Center(childLineBuffers[0].Vertices, childLineBuffers[0].VertexSize);
    mat4.multiplyVec3(transform, centerOne);
    
    var centerTwo = Help.Center(childLineBuffers[1].Vertices, childLineBuffers[1].VertexSize);
    mat4.multiplyVec3(transform, centerTwo);
    
    var toTwo = new Vector(centerOne).Subtract(centerTwo);
    toTwo = toTwo.Normalise().Multiply(10);
    
    var toOne = toTwo.Multiply(-1);
    toOne = toOne.Normalise().Multiply(10);
    
    children[0].Velocity = toTwo;
    children[1].Velocity = toOne;

    return children;
}

function BreakIntoLines(asteroid)
{
    function CreateLine(verts, vertSize)
    {
        var creation = new LineDebris(verts, vertSize);
        creation.Position = new Vector(asteroid.Position);
        creation.Velocity = asteroid.Velocity.Multiply(Math.random() * 2);
        
        creation.Angle = asteroid.Angle;
        creation.AngularVelocity = asteroid.AngularVelocity * Math.random() * 2;
        return creation;
    }

    var lines = [];
    //function LineDebris(vertices, verticeSize)
    var verts = asteroid.LineBuffer.Vertices;
    var len = asteroid.LineBuffer.NumItems;
    var vertSize = asteroid.LineBuffer.VertexSize;
    for(var i = 0; i < len; ++i)
    {
        var lineVerts = verts.slice(vertSize * i, vertSize * (i + 2));
        lines.push(CreateLine(lineVerts, vertSize));
    }
    
    var endVerts = verts.slice(vertSize * (len - 1), vertSize * len);
    Help.AddRange(endVerts, verts.slice(0, vertSize));
    lines.push(CreateLine(endVerts, vertSize));
    
    return lines;
}


function CreateAsteroidVerts(max_amount, min_amount, max_radius, min_radius)
{
    if (min_amount < 3)
        throw "Can't have less than 3 vertices";
        
    if (min_radius < 0.0000001)
        throw "Can't have mini asteroide";
    
    max_amount += 1;
    var vertCount = Math.floor( Math.random() * (max_amount - min_amount) + min_amount);
    
    var deltaAngle = -2.0 * Math.PI / vertCount;
    
    var rotation = mat4.create();
    mat4.identity(rotation);

    var vertices = [];
    for( var i = 0; i < vertCount; ++i)
    {
        var length = Math.random() * (max_radius - min_radius) + min_radius;
        
        var vertice = [length, 0, 0];
        mat4.multiplyVec3(rotation, vertice);
        
        vertices.push(vertice[0]);
        vertices.push(vertice[1]);
        vertices.push(vertice[2]);
        
        //add angle to rot matrix to turn vertice for next iteration
        mat4.rotate(rotation, deltaAngle, Vector.UNIT_Z);
    }
    
    return vertices;
}


