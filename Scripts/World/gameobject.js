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