
function CreateAsteroid(gl, max_size, min_size)
{
    var vertices = CreateAsteroidVerts(20, 6, max_size, min_size);
    //var vertices = CreateAsteroidVerts(6, 6, 250, 250);
    var lineBuffer = new LineLoop(gl, 3, vertices);

    return new Asteroid(lineBuffer);
}

function Asteroid(lineBuffer, position, angle)
{
    //private variables
    var transform = mat4.create();
    var color = Help.Colors.WHITE;
    
    //init
    this.Position = new Vector(position ? position : [0, 0]);
    this.Angle = angle ? angle : 0;
    this.Velocity = new Vector([0 , 0]);
    this.AngularVelocity = 0.1 * Math.PI;
    this.LineBuffer = lineBuffer;
    this.CreationTime = (new Date()).getTime();
    this.Color = Help.Colors.WHITE;

    this.Update = function(dt)
    {
        this.Angle += dt * this.AngularVelocity;
        this.Position = this.Position.Add( [dt * this.Velocity[0], dt * this.Velocity[1], 0]);
    }
    
    this.Draw = function(program)
    {
        var transform = this.GetTransform();

        program.SetWorld(transform);
        program.SetColor(color);
        
        lineBuffer.Draw(program, this.Color);
    }
    
    this.SetPosition = function(vec)
    {
        this.Position = vec;
    }
    
    this.GetTransform = function()
    {
        var transform = mat4.create();
        mat4.identity(transform);
        mat4.translate(transform, this.Position);
        mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
        
        return transform;
    }
    
    this.ContainsPoint = function(point)
    {
        return lineBuffer.ContainsPoint(point, this.GetTransform());
    }
    
    this.CollidesWith = function(other)
    {
        var now = new Date().getTime();
        var dt = (now - this.CreationTime) / 1000.0;
        if (dt < 0.2)
            return false;
    
        /*
        if ( !this.LineBuffer.CrudeCollidesWith(this.Position, other.LineBuffer, other.Position) )
            return false;
        */

        return this.LineBuffer.CollidesWith(this.GetTransform(), other.LineBuffer, other.GetTransform());
    }
    
    this.BreakInTwo = function()
    {
        var childLineBuffers = lineBuffer.SplitInTwo();
        if (!childLineBuffers)
            return [];
            
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


