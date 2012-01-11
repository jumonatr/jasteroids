var g_World = null;

function World()
{
    //Member Variables
    this.GameObjects = [];
    this.DESIRED_SIZE = 250;
    this.DesiredAspectRatio = 1;
    this.HalfSize = [this.DESIRED_SIZE / this.DesiredAspectRatio, this.DESIRED_SIZE * this.DesiredAspectRatio];
    
    //debug
    this.Culled = 0;
    
    //Private Initialisation    
    var canvas = document.getElementById("world");
    //THIS SHIT BE GLOBAL!
    gl = WebGLUtils.setupWebGL(canvas, {premultipliedAlpha: false});    
    if (!gl)
    {
        alert("Error creating WebGL context");
        return;
    }
    
    gl.clearColor(0,0,0,1);
    gl.disable( gl.CULL_FACE );
    gl.lineWidth( 2 );
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    var asteroidShader = CreateSimpleShader();

    var Projection = mat4.create();
    mat4.ortho(-this.HalfSize[0], this.HalfSize[0], -this.HalfSize[1], this.HalfSize[1], -1, 1, Projection);
    asteroidShader.SetProjection(Projection);
    
    setTimeout("Debug.RefreshDiagnostics()", 500);

    //Functions
    this.CreateAsteroid = function()
    {
        var created = CreateAsteroid(50, 20);
        //var created = new LineDebris([0, 0, 0, 100, 100, 0], 3);
        this.GameObjects.push( created );
        return created;
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
                
        for(var i = this.GameObjects.length - 1; i >= 0; --i)
        {
            if (this.GameObjects[i].ContainsPoint && this.GameObjects[i].ContainsPoint( worldPos ))
            {
                this.DestroyAsteroid(i);
                //this.GameObjects[i].Position = worldPos;
            }
        }        
    }
    
    this.DestroyAsteroid = function(index)
    {
        var split = this.GameObjects[index].BreakInTwo();
        this.GameObjects.splice(index, 1);
        
        for(var j = 0; j < split.length; ++j)
            this.GameObjects.push(split[j]);
    }
    
    this.CheckCollisions = function()
    {
        var toDestroy = [];
        var len = this.GameObjects.length;
        for(var i = len - 1; i >= 0; --i)
        {
            if (! (this.GameObjects[i] instanceof Asteroid) )
                continue;
                
            var hit = false;
            for(var j = i - 1; j >= 0; --j)
            {
                if (! (this.GameObjects[j] instanceof Asteroid) )
                    continue;

                if (!this.GameObjects[i].CollidesWith(this.GameObjects[j]))
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
        this.Culled = this.GameObjects.length;
        var worldSize = [[ -this.HalfSize[0], -this.HalfSize[1] ], [ this.HalfSize[0], this.HalfSize[1] ]];
        var lastIdx = this.GameObjects.length - 1;
        for (var i = lastIdx; i >= 0; i--)
        {
            this.GameObjects[i].Update(dt);
            
            if (!this.GameObjects[i].IsAlive)
            {
                this.GameObjects.splice(i, 1);
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