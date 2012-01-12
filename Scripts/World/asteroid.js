
function CreateAsteroid(max_size, min_size)
{
    var vertices = CreateAsteroidVerts(Data.MaxAsteroidDivisions, Data.MinAsteroidDivisions, max_size, min_size);
    //var vertices = CreateAsteroidVerts(6, 6, 250, 250);
    var lineBuffer = new LineLoop(3, vertices);

    return new Asteroid(lineBuffer);
}

Asteroid.prototype = new GameObject();

function Asteroid(lineBuffer, position, angle)
{    
    //init
    if (position)
        this.Position = position;
        
    if (angle)
        this.Angle = angle;

    this.Shape = lineBuffer;
    this.Radius = this.Shape.BoundingRadius;
    this.CreationTime = (new Date()).getTime();
    this.Color = Help.Colors.WHITE;       
}

Asteroid.prototype.IsVisible = function(lowerLeft, topRight)
{
    return Physics.CircleInBox(this.Position, this.Radius, lowerLeft, topRight);
}

Asteroid.prototype.Update = function(dt)
{
    this.UpdateMouvement(dt);
    this.StayInWorld(dt);
}

Asteroid.prototype.Draw = function(program)
{
    var transform = this.GetTransform();

    program.SetWorld(transform);        
    this.Shape.Draw(program, this.Color);
}

Asteroid.prototype.ContainsPoint = function(point)
{
    return this.Shape.ContainsPoint(point, this.GetTransform());
}

Asteroid.prototype.CollidesWith = function(other)
{
    var now = new Date().getTime();
    var dt = (now - this.CreationTime) / 1000.0;
    if (dt < 0.2)
        return false;

    if ( !this.Shape.CrudeCollidesWith(this.Position, other.Shape, other.Position) )
        return false;

    return this.Shape.CollidesWith(this.GetTransform(), other.Shape, other.GetTransform());
}

Asteroid.prototype.Break = function()
{
    try
    {
    var childShapes = this.Shape.SplitInTwo();
    if (!childShapes)
        return this.Shape.SplitIntoLines(this.Position, this.Velocity, this.Angle, this.AngularVelocity);
    }
    catch(e)
    {
        console.error("Failed to split shape in asteroid, falling back to split into lines: " + e);
        return this.Shape.SplitIntoLines(this.Position, this.Velocity, this.Angle, this.AngularVelocity);
    }
        
    var children = [ new Asteroid(childShapes[0], this.Position, this.Angle), new Asteroid(childShapes[1], this.Position, this.Angle) ];
    var transform = this.GetTransform();
    
    var centerOne = Help.Center(childShapes[0].Vertices, childShapes[0].VertexSize);
    mat4.multiplyVec3(transform, centerOne);
    
    var centerTwo = Help.Center(childShapes[1].Vertices, childShapes[1].VertexSize);
    mat4.multiplyVec3(transform, centerTwo);
    
    var toTwo = new Vector(centerOne).Subtract(centerTwo);
    toTwo = toTwo.Normalise().Multiply(10);
    
    var toOne = toTwo.Multiply(-1);
    toOne = toOne.Normalise().Multiply(10);
    
    children[0].Velocity = toTwo;
    children[1].Velocity = toOne;

    return children;
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


