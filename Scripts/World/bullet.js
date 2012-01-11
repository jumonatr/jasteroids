
Bullet.prototype = new GameObject();

//todo batch all bullets together
function Bullet(position, velocity)
{
    this.Color = [1, 1, 1, 1];
    this.Buffer = gl.createBuffer();
    this.Radius = 1;
    this.Velocity = velocity;
    this.Position = position;
    
    this.LifeSpan = 10000;
    this.CreationTime = (new Date()).getTime();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0]), gl.STATIC_DRAW);
}

Bullet.prototype.Update = function(dt)
{    
    this.UpdateMouvement(dt);
    this.StayInWorld(dt);
    
    var lifetime = (new Date().getTime() - this.CreationTime);
    if (lifetime > this.LifeSpan)
        this.IsAlive = false;
}

Bullet.prototype.Draw = function(program)
{
    var transform = this.GetTransform();
    program.SetWorld(transform);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer);
    gl.enableVertexAttribArray(program.AttribPos);
    gl.vertexAttribPointer(program.AttribPos, 3, gl.FLOAT, false, 0, 0);
    
    program.SetColor(this.Color);
    
    gl.drawArrays(gl.POINTS, 0, 1);
}