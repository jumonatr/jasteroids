function GameObject()
{
    this.Position = new Vector([0, 0]);
    this.Angle = 0;
    this.Velocity = new Vector([0 , 0]);
    this.AngularVelocity = 0;
    this.IsAlive = true;
}

GameObject.prototype.IsVisible = function(lowerLeft, topRight)
{
    return true;
}

/*
Function for getting a matrix representing the world transform from position and rotation of a gameobject
*/
GameObject.prototype.GetTransform = function()
{
    var transform = mat4.create();
    mat4.identity(transform);
    mat4.translate(transform, this.Position);
    mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
    
    return transform;
}

/*
Helper function for simple mouvement
*/
GameObject.prototype.UpdateMouvement = function(dt)
{
    this.Angle += dt * this.AngularVelocity;
    this.Position = this.Position.Add( [dt * this.Velocity[0], dt * this.Velocity[1], 0]);
}

/*
Helper function stay in world
*/
GameObject.prototype.StayInWorld = function(dt)
{
    if (!this.Radius)
        return;
    
    var bounds = g_World.GetBounds();

    if ( Physics.CircleInBox(this.Position, 1.5 * this.Radius, bounds[0], bounds[1]) )
        return;
    
    if (!Physics.CircleInBox(this.Position, 1.5 * this.Radius, new Vector(bounds[0]).Multiply(2), new Vector(bounds[1]).Multiply(2)))
    {
        var xCoord = this.Position.X;
        this.Position.X = xCoord.clamp(bounds[0][0] - this.Radius, bounds[1][0] + this.Radius);
        var yCoord = this.Position.Y;
        this.Position.Y = yCoord.clamp(bounds[0][1] - this.Radius, bounds[1][1] + this.Radius);
    }
            
    var toCenter = this.Position.Multiply(-1);
    
    if (this.Position.X < bounds[0][0] || this.Position.X > bounds[1][0])
    {
        if (toCenter.X.sign() !=  this.Velocity.X.sign())
            this.Position.X *= -1;
    }
        
    if (this.Position.Y < bounds[0][1] || this.Position.Y > bounds[1][1])
    {
        if (toCenter.Y.sign() !=  this.Velocity.Y.sign())
            this.Position.Y *= -1;
    }
}