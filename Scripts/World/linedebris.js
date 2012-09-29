/*
Copyright (C) 2012 Julien Monat-Rodier
Licence in LICENCE.txt
*/


﻿
LineDebris.prototype = new GameObject();

//todo batch all lines together
function LineDebris(vertices, verticeSize)
{
    this.Color = [1, 1, 1, 1];
    this.Buffer = gl.createBuffer();
    this.VerticeSize = verticeSize;
    this.NumItems = vertices.length / verticeSize;
    this.LifeSpan = Math.random() * Data.MaxDebrisLifeSpan + 1;
    this.CreationTime = (new Date()).getTime();
    this.LifeMultiplier = 1;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

LineDebris.prototype.Update = function(dt)
{
    var lifetime = (new Date().getTime() - this.CreationTime) / 1000.0;
    var inverseLifeRatio = 1 - lifetime / this.LifeSpan;
    this.LifeMultiplier = inverseLifeRatio > 0 ? inverseLifeRatio : 0;
    this.IsAlive = inverseLifeRatio > 0;

    this.UpdateMouvement(dt);
}

LineDebris.prototype.Draw = function(program)
{
    var transform = this.GetTransform();
    program.SetWorld(transform);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer);
    gl.enableVertexAttribArray(program.AttribPos);
    gl.vertexAttribPointer(program.AttribPos, this.VerticeSize, gl.FLOAT, false, 0, 0);

    var renderColor = [
        this.LifeMultiplier * this.Color[0], this.LifeMultiplier * this.Color[1],
        this.LifeMultiplier * this.Color[2], this.LifeMultiplier * this.Color[3]
        ];
        
    program.SetColor(renderColor);

    gl.drawArrays(gl.LINE_STRIP, 0, this.NumItems);

    if (Debug.RenderPoints)
        gl.drawArrays(gl.POINTS, 0, this.NumItems);
}
