/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿Ship.prototype = new GameObject();

function Ship(position, angle)
{
    //init
    this.Position = position || new Vector([0, 0]);
    this.Angle = angle || 0;

    this.HalfHeight = 7;
    var coef = 7;
    var shape =
    [
        -2 * this.HalfHeight, -this.HalfHeight,
        2 * this.HalfHeight, -this.HalfHeight,
        0, 5 * this.HalfHeight
    ];

    this.Shape = new LineLoop(2, shape);
    this.Radius = this.Shape.BoundingRadius;
    this.CreationTime = (new Date()).getTime();
    this.Color = Help.Colors.YELLOW;

    var lastSpawn = new Date().getTime();
    var lastShot = new Date().getTime();
    this.UpdateParticles = function()
    {
        var now = new Date().getTime();

        var sqrlen = this.Velocity.GetSquareLength();
        if (sqrlen > 0 && Input.IsKeyPressed(Input.Keys.UP_ARROW))
        {
            if (now - lastSpawn > Data.ExhaustSpawnTime / (0.005 * Math.sqrt(sqrlen)))
            {
                lastSpawn = now;
                this.CreateExhaustParticle(shape);
            }
        }

        if (now - lastShot  > Data.BulletShootTime && Input.IsKeyPressed(Input.Keys.CTRL) && g_World.Bullets.length < Data.MaxBullets)
        {
            lastShot = now;
            this.Fire();
        }

    }
}

Ship.prototype.Fire = function()
{
    var bulletVelocity = new Vector( [0, Data.BulletSpeed, 0] );

    var transform = mat4.create();
    mat4.identity(transform);
    mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
    mat4.multiplyVec3(transform, bulletVelocity);
    bulletVelocity = bulletVelocity.Add(this.Velocity);

    transform = this.GetTransform();
    var bulletPosition = new Vector([0, 5 * this.HalfHeight, 0]);
    mat4.multiplyVec3( transform, bulletPosition );

    g_World.SpawnGameObject( new Bullet(bulletPosition, bulletVelocity) );
}

Ship.prototype.CreateExhaustParticle = function(shape)
{
    var vertices = shape.slice(0,4);
    for(var i = 0; i < vertices.length; ++i)
        vertices[i] *= Math.random() * 0.4 + 0.1;

    var creation = new LineDebris(vertices, 2);
    creation.Angle = 0;
    creation.AngularVelocity = Math.random() * 2 * Math.PI;
    creation.Velocity = new Vector( [0, -Math.random(), 0] ).Multiply(50);

    var transform = mat4.create();
    mat4.identity(transform);
    mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
    mat4.multiplyVec3(transform, creation.Velocity);

    transform = this.GetTransform();
    var pos = [0, -this.HalfHeight, 0];
    mat4.multiplyVec3( transform, pos );
    creation.Position = new Vector( pos );

    g_World.SpawnGameObject(creation);
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
    var velocity = new Vector([0, dt * Data.EngineAccel * input[1], 0]);

    var transform = mat4.create();
    mat4.identity(transform);
    mat4.rotate(transform, this.Angle, Vector.UNIT_Z);
    mat4.multiplyVec3(transform, velocity);

    this.Velocity = this.Velocity.Add(velocity);

    var angularVel = dt * input[0] * Data.RotationAccel;
    this.AngularVelocity += angularVel;

    this.Angle += dt * this.AngularVelocity;
    this.AngularVelocity *= Data.RotationDegradation;

    this.Position = this.Position.Add( [dt * this.Velocity[0], dt * this.Velocity[1], 0]);
    this.Velocity = this.Velocity.Multiply(Data.EngineDegradation);

    this.StayInWorld(dt);

    this.UpdateParticles();
}

Ship.prototype.Draw = function(program)
{
    var transform = this.GetTransform();

    program.SetWorld(transform);
    this.Shape.Draw(program, this.Color);
}

Ship.prototype.CollidesWith = function(other)
{
    if ( !this.Shape.CrudeCollidesWith(this.Position, other.Shape, other.Position) )
        return false;

    return this.Shape.CollidesWith(this.GetTransform(), other.Shape, other.GetTransform());
}

