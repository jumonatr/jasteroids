var g_World = null;

function World()
{
    //Member Variables
    this.Asteroids = [];
    this.DESIRED_SIZE = 250;
    this.DesiredAspectRatio = 1;
    this.HalfSize = [this.DESIRED_SIZE / this.DesiredAspectRatio, this.DESIRED_SIZE * this.DesiredAspectRatio];
    
    //Private Initialisation    
    var canvas = document.getElementById("world");
    var gl = WebGLUtils.setupWebGL(canvas);
    
    if (!gl)
    {
        alert("Error creating WebGL context");
        return;
    }
    
    gl.clearColor(0,0,0,1);
    gl.disable( gl.CULL_FACE );
    gl.lineWidth( 2 );
    
    var asteroidShader = CreateSimpleShader(gl);

    var Projection = mat4.create();
    mat4.ortho(-this.HalfSize[0], this.HalfSize[0], -this.HalfSize[1], this.HalfSize[1], -1, 1, Projection);
    asteroidShader.SetProjection(Projection);

    //Functions
    this.CreateAsteroid = function()
    {
        var created = CreateAsteroid(gl, 50, 20);
        this.Asteroids.push( created );
        return created;
    }

    function FindAsteroidsAtPoint(x, y)
    {
        var worldPos = [x, y];
        var found = [];
        for(var i = this.Asteroids.length - 1; i >= 0; --i)
        {
            if (!this.Asteroids[i].ContainsPoint(worldPos))
                continue;
                
            found.push(this.Asteroids[i]);
        }
    }
    
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
                
        for(var i = this.Asteroids.length - 1; i >= 0; --i)
        {
            if (this.Asteroids[i].ContainsPoint( worldPos ))
            {
                //this.DestroyAsteroid(i);
                this.Asteroids[i].SetPosition( worldPos );
            }
        }        
    }
    
    this.DestroyAsteroid = function(index)
    {
        var split = this.Asteroids[index].BreakInTwo();
        this.Asteroids.splice(index, 1);
        
        for(var j = 0; j < split.length; ++j)
            this.Asteroids.push(split[j]);
    }
    
    this.CheckCollisions = function()
    {
        var toDestroy = [];
        var len = this.Asteroids.length;
        for(var i = len - 1; i >= 0; --i)
        {
            var hit = false;
            for(var j = i - 1; j >= 0; --j)
            {
                if (!this.Asteroids[i].CollidesWith(this.Asteroids[j]))
                    continue;
                
                toDestroy.push(j);
                hit = true;
            }
            
            if (hit)
                toDestroy.push(i);
        }
        
        if (toDestroy.length == 0)
            return;
        
        toDestroy = toDestroy.unique();
        
        for(var i = toDestroy.length - 1; i >= 0; --i)
            this.DestroyAsteroid(toDestroy[i]);
    }
    
    var last = new Date().getTime();
    this.Update = function()
    {
        var now = new Date().getTime();
        var dt = (now - last) / 1000.0;
        last = now;
    
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        asteroidShader.Enable();
        for (var i = this.Asteroids.length - 1; i >= 0; i--)
        {
            this.Asteroids[i].Update(dt);
            this.Asteroids[i].Draw(asteroidShader);
        }
        
        this.CheckCollisions();
        
        requestAnimFrame(function() { g_World.Update(); });
    }
    
    this.Resized = function()
    {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        var aspectRatio = canvas.clientWidth / canvas.clientHeight;
    
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
    
    //initialise render window
    this.Resized();
    
    //create world objects
    this.CreateAsteroid();
    
    //Start Main Loop
    this.Update();
}

World.Init = function()
{
    g_World = new World();
}