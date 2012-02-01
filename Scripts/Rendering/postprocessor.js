/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/

function PostProcessor()
{
    this.FrameBuffer = null;
    this.Texture = null;
    
    this.ScreenVertices = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
        ]);
        
    this.VertexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.ScreenVertices, gl.STATIC_DRAW);
    
    this.Shader = CreatePostShader();
    this.Shader.Enable();
    this.Shader.sampler = gl.getUniformLocation(this.Shader, "sampler");
    this.Shader.time = gl.getUniformLocation(this.Shader, "time");
}

PostProcessor.prototype.InitialiseFrameBuffer = function(width, height)
{
    this.ClientWidth = width;
    this.ClientHeight = height;

    this.FrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FrameBuffer);
    this.FrameBuffer.width = Math.round(width * 0.5);
    this.FrameBuffer.height = Math.round(height * 0.5);
    
    this.Texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.FrameBuffer.width, this.FrameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.FrameBuffer.width, this.FrameBuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.Texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

PostProcessor.prototype.Begin = function()
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FrameBuffer);
    
    gl.viewport(0, 0, this.FrameBuffer.width, this.FrameBuffer.height);
}

PostProcessor.prototype.End = function()
{
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

var testTime = new Date().getTime();
var accumTime = 0;
PostProcessor.prototype.Draw = function()
{
    gl.viewport(0, 0, this.ClientWidth, this.ClientHeight);
    
    this.Shader.Enable();
    
    var projection = mat4.create();
    mat4.identity(projection);
    mat4.ortho(-1, 1, -1, 1, -1, 1, projection);
    this.Shader.SetProjection(projection);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);
    gl.enableVertexAttribArray(this.Shader.AttribPos);
    gl.vertexAttribPointer(this.Shader.AttribPos, 2, gl.FLOAT, false, 0, 0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
    gl.uniform1i(this.Shader.sampler, 0);
    
    var now = new Date().getTime();
    var delta = testTime - now;
    testTime = now;
    accumTime += delta;    
    
    gl.uniform1f(this.Shader.time, accumTime / 1000);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
