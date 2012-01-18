/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿function Game()
{
    this.Round = 0;
    this.ToSpawn = 0;
}

Game.prototype.Start = function()
{
    this.Update();
}

Game.prototype.Update = function()
{
    Help.CallIn(1000, this, "Update");

    if (g_World.Asteroids.length > 0)
        return;

    this.Round++;

    this.BeginRound();
}

Game.prototype.PlaceAsteroid = function()
{
    var bounds = g_World.GetBounds();
    var choice = Math.round( Math.random() );
    var xMul = choice * Math.random();
    var yMul = (1 - choice) * Math.random();

    var side = this.ToSpawn % 2;//Math.round( Math.random() );
    var point = new Vector( bounds[side] );
    var delta = new Vector( bounds[1 - side] ).Subtract( point.Multiply(side) );

    var delPos = new Vector( xMul * delta[0], yMul * delta[1] );
    var pos = point.Add(delPos);

    var created = g_World.CreateAsteroidWithoutSpawning();
    created.Position = pos;

    var toCenter = Vector.ZERO.Subtract(pos);
    toCenter.Normalise();
    toCenter = toCenter.Multiply( Math.abs(g_World.CreateRandomAsteroidSpeed()) ).Rotate( 2 * (Math.random() - 0.5) * Math.PI * 0.25 );
    created.Velocity = toCenter;

    if (!g_World.GameObjectCollides(created))
    {
        this.ToSpawn--;
        g_World.SpawnGameObject(created);
    }

    if (this.ToSpawn > 0)
        Help.CallIn(2000, this, "PlaceAsteroid");
}

Game.prototype.BeginRound = function()
{
    this.ToSpawn = Data.AsteroidsPerRound * this.Round;
    Help.CallIn(1000, this, "PlaceAsteroid");
}
