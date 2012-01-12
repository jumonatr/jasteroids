var g_World = null;

function World(game)
{
    g_World = this;
    var canvas = document.getElementById("world");
    
    //Member Variables
    this.GameObjects = [];
    this.Asteroids = [];
    this.Bullets = [];
    
    this.DesiredAspectRatio = 1;
    this.HalfSize = [0.5 * canvas.width, 0.5 * canvas.height];
    
    //debug
    this.Culled = 0;
    this.FPS = 0;

    //Private Initialisation
    //THIS SHIT BE GLOBAL!
    gl = WebGLUtils.setupWebGL(canvas, {premultipliedAlpha: false});    
    if (!gl)
        return;
    
    document.getElementById("nowebgl").style.display = "none";
    
    gl.clearColor(0,0,0,1);
    gl.disable( gl.CULL_FACE );
    gl.lineWidth( 2 );
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    var asteroidShader = CreateSimpleShader();

    var Projection = mat4.create();
    mat4.ortho(-this.HalfSize[0], this.HalfSize[0], -this.HalfSize[1], this.HalfSize[1], -1, 1, Projection);
    asteroidShader.SetProjection(Projection);

    //Functions    
    this.Clicked = function(canvas, event)
    {
        if (canvas.width == 0 || canvas.height == 0)
            return;
           
        var clickXRatio = (event.clientX - canvas.offsetLeft) / canvas.width;
        var clickYRatio = (event.clientY - canvas.offsetTop) / canvas.height;
        
        var worldX = Help.Lerp(-this.HalfSize[0], this.HalfSize[0], clickXRatio);
        var worldY = Help.Lerp(this.HalfSize[1], -this.HalfSize[1], clickYRatio);
        
        var worldPos = new Vector([ worldX , worldY ]);

        if (event.button == 1)
        {
            var ast = this.CreateAsteroid();
            ast.Position = worldPos;
            return;
        }
                
        for(var i = this.GameObjects.length - 1; i >= 0; --i)
        {
            if (this.GameObjects[i].ContainsPoint && this.GameObjects[i].ContainsPoint( worldPos ))
            {
                this.DestroyGameObject(i);
            }
        }        
    }
        
    var last = new Date().getTime();
    this.Update = function()
    {
        var now = new Date().getTime();
        var dt = (now - last) / 1000.0;
        this.FPS = dt != 0 ? 1 / dt : "N/A";
        last = now;
    
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        asteroidShader.Enable();
        this.Culled = this.GameObjects.length;
        var worldSize = this.GetBounds();
        var lastIdx = this.GameObjects.length - 1;
        for (var i = lastIdx; i >= 0; i--)
        {
            this.GameObjects[i].Update(dt);
            
            if (!this.GameObjects[i].IsAlive)
            {
                this.DestroyGameObject(i);
                continue;
            }
            
            if ( this.GameObjects[i].IsVisible(worldSize[0], worldSize[1]) )
            {
                this.GameObjects[i].Draw(asteroidShader);
                this.Culled--;
            }
        }
        
        this.CheckCollisions();
        
        requestAnimFrame(function() { g_World.Update(); });
    }
    
    this.Resized = function()
    {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.HalfSize = [0.5 * canvas.width, 0.5 * canvas.height];
    
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
        
        asteroidShader.Enable();
        var Projection = mat4.create();
        mat4.ortho(-this.HalfSize[0], this.HalfSize[0], -this.HalfSize[1], this.HalfSize[1], -1, 1, Projection);
        asteroidShader.SetProjection(Projection);
    }
    
    //initialise render window
    this.Resized();
    
    //create world objects
    //this.CreateAsteroid();
    this.CreatePlayer();
    
    //Start Main Loop
    this.Update();
    game.Start();
}

World.prototype.CreateAsteroid = function()
{
    var created = CreateAsteroid(Data.MaxAsteroidSize, Data.MinAsteroidSize);
    created.AngularVelocity = (Math.random() - 0.5) * 0.4 * Math.PI;
    
    var maxSpeed = Data.MaxAsteroidSpeed;
    created.Velocity = new Vector(maxSpeed * (Math.random() - 0.5), maxSpeed * (Math.random() - 0.5));

    //var created = new LineDebris([0, 0, 0, 100, 100, 0], 3);
    //var created = new Ship();
    this.SpawnGameObject(created);
    return created;
}

World.prototype.CreatePlayer = function()
{
    this.SpawnGameObject( new Ship() );
}


World.prototype.GetBounds = function()
{
    return [[ -this.HalfSize[0], -this.HalfSize[1] ], [ this.HalfSize[0], this.HalfSize[1] ]];
}

World.prototype.SpawnGameObject = function(toSpawn)
{
    if (toSpawn instanceof Asteroid)
        this.Asteroids.push(toSpawn);
    else if (toSpawn instanceof Bullet)
        this.Bullets.push(toSpawn);
    
    this.GameObjects.push(toSpawn);
}

World.prototype.DestroyGameObject = function(element)
{
    var go;
    if (typeof(element) == "number")
        go = this.GameObjects[element];
    else
        go = element;
   
    if (go instanceof Ship)
        return; //invulnerable for now

    if (typeof(element) == "number")
        this.GameObjects.splice(element, 1);
    else
        this.GameObjects.remove(go);
            
    if (go instanceof Asteroid)
        this.Asteroids.remove(go);
    else if (go instanceof Bullet)
        this.Bullets.remove(go);
    
    if (go.Break)
    {
        var split = go.Break();
        for(var j = 0; j < split.length; ++j)
            this.SpawnGameObject(split[j]);
    }
}
        
World.prototype.CheckCollisions = function()
{
    var toDestroy = [];
    var len = this.GameObjects.length;
    for(var i = len - 1; i >= 0; --i)
    {
        if (!this.GameObjects[i].CollidesWith)
            continue;
            
        var hit = false;
        for(var j = i - 1; j >= 0; --j)
        {
            if (! this.GameObjects[j].CollidesWith )
                continue;

            if (!this.GameObjects[i].CollidesWith(this.GameObjects[j]))
                continue;
            
            toDestroy.push(j);
            hit = true;
        }
        
        if (hit)
            toDestroy.push(i);
    }
    
    var lastBullet = this.Bullets.length - 1;
    var lastGo = this.GameObjects.length - 1;
    for(var b = lastBullet; b >= 0; --b)
    {
        var collided = false;
        for(var i = lastGo; i >= 0; --i)
        {
            if (this.GameObjects[i].ContainsPoint && 
                this.GameObjects[i].ContainsPoint( this.Bullets[b].Position ))
            {
                toDestroy.push(i);
                Statistics.AsteroidKilled();
                collided = true;
            }
        }
        
        if (collided)
            toDestroy.push(this.Bullets[b]);
    }
    
    if (toDestroy.length == 0)
        return;
    
    toDestroy = toDestroy.unique();
    
    for(var i = 0; i < toDestroy.length; ++i)
        this.DestroyGameObject(toDestroy[i]);
}



World.Init = function()
{
    var game = new Game();
    g_World = new World(game);
}