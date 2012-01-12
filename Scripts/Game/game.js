function Game()
{
    this.Round = 0;
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

Game.prototype.BeginRound = function()
{
    var bounds = g_World.GetBounds();
    var asteroidCount = Data.AsteroidsPerRound * this.Round;
    for (var i = 0; i < asteroidCount; ++i)
    {
        var choice = Math.round( Math.random() );
        var xMul = choice * Math.random();
        var yMul = (1 - choice) * Math.random();
        
        var side = Math.round( Math.random() );
        var point = new Vector( bounds[side] );
        var delta = new Vector( bounds[1 - side] ).Subtract( point.Multiply(-side) );
        
        var delPos = new Vector( xMul * delta[0], yMul * delta[1] );
        var pos = point.Add(delPos);
        
        var created = g_World.CreateAsteroid();
        created.Position = pos;
    }
}