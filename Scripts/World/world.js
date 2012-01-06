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
    
    //Functions
    this.CreateAsteroids = function()
    {
        var Projection = mat4.create();
        mat4.ortho(-this.HalfSize[0], this.HalfSize[0], -this.HalfSize[1], this.HalfSize[1], -1, 1, Projection);
        asteroidShader.SetProjection(Projection);
    
        this.Asteroids.push( CreateAsteroid(gl, 50, 20) );
    }
    
    var last = new Date().getTime();
    
    this.Clicked = function(canvas, event)
    {
        if (canvas.width == 0 || canvas.height == 0)
            return;
           
        var clickXRatio = (event.clientX - canvas.offsetLeft) / canvas.width;
        var clickYRatio = (event.clientY - canvas.offsetTop) / canvas.height;
        
        var worldX = Help.Lerp(-this.HalfSize[0], this.HalfSize[0], clickXRatio);
        var worldY = Help.Lerp(this.HalfSize[1], -this.HalfSize[1], clickYRatio);
        
        var worldPos = [ worldX , worldY ];
        
        for(var i = this.Asteroids.length - 1; i >= 0; --i)
        {
            if (this.Asteroids[i].ContainsPoint(worldPos))
            {
                var split = this.Asteroids[i].BreakInTwo();
                this.Asteroids.splice(i, 1);
                
                for(var j = 0; j < split.length; ++j)
                    this.Asteroids.push(split[j]);
            }
        }        
    }
    
    this.Update = function()
    {
        var now = new Date().getTime();
        var dt = (now - last) / 1000.0;
        last = now;
    
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(asteroidShader);
        for (var i = this.Asteroids.length - 1; i >= 0; i--)
        {
            this.Asteroids[i].Update(dt);
            this.Asteroids[i].Draw(asteroidShader);
        }
        
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
    this.CreateAsteroids();
    
    //Start Main Loop
    this.Update();
}

World.Init = function()
{
    g_World = new World();
}