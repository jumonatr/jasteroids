Ship.prototype = new GameObject();

function Ship(position, angle)
{
    //init
    this.Position = position || new Vector([0, 0]);
    this.Angle = angle || 0;
    
    var coef = 7;
    var shape = 
    [
        -2 * coef, -coef,
        2 * coef, -coef,
        0, 5 * coef
    ];

    this.LineBuffer = new LineLoop(2, shape);
    this.Radius = this.LineBuffer.BoundingRadius;
    this.CreationTime = (new Date()).getTime();
    this.Color = Help.Colors.YELLOW;
    
    this.EngineAccel = 500;
    this.EngineDegradation = 0.99;
    
    this.RotationAccel = Math.PI;
    this.RotationDegradation = 0.98;
}

Ship.prototype.CreateInputVector = function()
{
    var vect = [0,0];
    if (Input.IsKeyPressed(Input.Keys.LEFT_ARROW))
        vect[0]++;
    if (Input.IsKeyPressed(Input.Keys.RIGHT_ARROW))
        vect[0]--;
   
    if (Input.IsKeyPressed(Input.Keys.UP_ARROW))
        vect[1]++;
    if (Input.IsKeyPressed(Input.Keys.DOWN_ARROW))
        vect[1]--;
        
    return vect;
}

Ship.prototype.Update = function(dt)
{
    var input = this.CreateInputVector();
    var velocity = new Vector([0, dt * this.EngineAccel * input[1], 0]);

    var transform = mat4.create();
    mat4.identity(transform);
    mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
    mat4.multiplyVec3(transform, velocity);
    
    this.Velocity = this.Velocity.Add(velocity);
    
    var angularVel = dt * input[0] * this.RotationAccel;
    this.AngularVelocity += angularVel;

    this.Angle += dt * this.AngularVelocity;
    this.AngularVelocity *= this.RotationDegradation;
    
    this.Position = this.Position.Add( [dt * this.Velocity[0], dt * this.Velocity[1], 0]);
    this.Velocity = this.Velocity.Multiply(this.EngineDegradation);

    this.StayInWorld(dt);
}

Ship.prototype.Draw = function(program)
{
    var transform = this.GetTransform();

    program.SetWorld(transform);        
    this.LineBuffer.Draw(program, this.Color);
}
