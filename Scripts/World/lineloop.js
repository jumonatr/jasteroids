//Line Buffer class used to keep vertices and draw them as a line_loop

function LineLoop(gl, verticeSize, vertices)
{
    this.NumItems = vertices.length / verticeSize;
    this.VertexBuffer = gl.createBuffer();
    this.VertexSize = verticeSize;
    this.Vertices = vertices;
    this.BoundingRadius = Help.GetBufferBoundingRadius(vertices, verticeSize);
    this.ConvexePolys = (new EarclipDecomposer()).ConvexPartitionFromBuffer(vertices, verticeSize);
    
    var convexeBuffs = [];
    
    for(var i = 0; i < this.ConvexePolys.length; ++i)
    {
        var len = this.ConvexePolys[i].length;
        var bufferData = Help.ConvertVectorArrayToVertexBuffer( this.ConvexePolys[i] );
        var buffer = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);					
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
        
        convexeBuffs.push( { count : len, buff : buffer });
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);					
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.Draw = function(program, color)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);
        gl.enableVertexAttribArray(program.AttribPos);
        gl.vertexAttribPointer(program.AttribPos, verticeSize, gl.FLOAT, false, 0, 0);
        program.SetColor(color);
        
        gl.drawArrays(gl.LINE_LOOP, 0, this.NumItems);
        gl.drawArrays(gl.POINTS, 0, this.NumItems);
        
        for(var i = 0; i < convexeBuffs.length; ++i)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, convexeBuffs[i].buff);
            gl.enableVertexAttribArray(program.AttribPos);
            gl.vertexAttribPointer(program.AttribPos, 3, gl.FLOAT, false, 0, 0);
            program.SetColor([1, 0, 0, 1]);
            
            gl.drawArrays(gl.LINE_LOOP, 0, convexeBuffs[i].count);
        }
    }
    
    function GetVert(i)
    {
        var start = i * verticeSize;
        var end = start + 3;
        return vertices.slice(start, end);
    }
    
    this.ContainsPoint = function(point, transform)
    {
        var hit = false;
        var nvert = this.NumItems;
        
        for (var i = 0, j = nvert - 1; i < nvert; j = i++)
    	{
    		var jVert = GetVert(j);
    		mat4.multiplyVec3(transform, jVert);
    		
    		var iVert = GetVert(i);
    		mat4.multiplyVec3(transform, iVert);
    		
    		if ( ((iVert[1] > point[1]) != (jVert[1] > point[1]))
    				&&
    			(point[0] < (jVert[0] - iVert[0]) * (point[1] - iVert[1]) /
    				(jVert[1] - iVert[1]) + iVert[0]) )
    		{
    			hit = !hit;
    		}
    	}
    	
    	return hit;
    }
    
    this.CrudeCollidesWith = function(position, other, positionOther)
    {
        return Physics.CirclesCollide(position, this.BoundingRadius, positionOther, other.BoundingRadius);
    }
        
    this.CollidesWith = function(transform, other, transformOther)
    {            
        for(var i = 0; i < this.ConvexePolys.length; ++i)
        {
            for(var j = 0; j < other.ConvexePolys.length; ++j)
            {
                var one = Physics.TransformShape(this.ConvexePolys[i], transform);
                var two = Physics.TransformShape(other.ConvexePolys[j], transformOther);

                if (Physics.ConvexeShapesCollide(one, two))
                    return true;
            }
        }
        
        return false;
    }
    
    this.SplitInTwo = function()
    {
        if (vertices.length <= 5 * verticeSize )
            return null;

        var halfIdx = Math.floor(this.NumItems / 2.0);
         
        //duplicate the array to modify it later on
        var second = vertices.slice(0);
        
        //randomize order
        for (var i = 0; i < Math.random() * this.NumItems; ++i)
        {
            for (var j = 0; j < verticeSize; ++j)
            {
                second.push( second.shift(), second.shift(), second.shift() );
            }
        }
        
        var first = second.slice(0, verticeSize * (halfIdx + 1));
        
        //remove all but the first and last vertices of the first split from the second
        second.splice(verticeSize, first.length - 2 * verticeSize);
        
        //  
        //  4 + 1
        //  3   2  
        //
        var toAddFirst = Help.Center( [ first[0], first[1], first[2], first[first.length - 3], first[first.length - 2], first[first.length - 1] ], verticeSize);
        first.push(toAddFirst[0], toAddFirst[1], toAddFirst[2]);
        
        //  
        //  3   4
        //  2 + 1  
        //
        var toAddSecond = Help.Center( second.slice(0, 2 * verticeSize), verticeSize);
        second.splice(verticeSize, 0, toAddSecond[0], toAddSecond[1], toAddSecond[2]);
        
        return [ new LineLoop(gl, verticeSize, first), new LineLoop(gl, verticeSize, second) ];
    }
}
