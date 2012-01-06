//Line Buffer class used to keep vertices and draw them as a line_loop

function LineLoop(gl, itemSize, vertices)
{
    this.NumItems = vertices.length / itemSize;
    this.VertexBuffer = gl.createBuffer();
    this.VertexSize = itemSize;
    this.Vertices = vertices;
    this.BoundingRadius = Help.GetBufferBoundingRadius(vertices, itemSize);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);					
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.Draw = function(program)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexBuffer);
        gl.enableVertexAttribArray(program.AttribPos);
        gl.vertexAttribPointer(program.AttribPos, itemSize, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.LINE_LOOP, 0, this.NumItems);
        gl.drawArrays(gl.POINTS, 0, this.NumItems);
    }
    
    function GetVert(i)
    {
        var start = i * itemSize;
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
    
    this.CollidesWith = function(position, other, positionOther)
    {
        if ( !Physics.CirclesCollide(position, this.BoundingRadius, positionOther, other.BoundingRadius) )
            return false;
            
        throw new Error("Not Implemented");
    }
    
    this.SplitInTwo = function()
    {
        if (vertices.length <= 5 * itemSize )
            return null;

        var halfIdx = Math.floor(this.NumItems / 2.0);
         
        //duplicate the array to modify it later on
        var second = vertices.slice(0);
        
        //randomize order
        for (var i = 0; i < Math.random() * this.NumItems; ++i)
        {
            for (var j = 0; j < itemSize; ++j)
            {
                second.push( second.shift(), second.shift(), second.shift() );
            }
        }
        
        var first = second.slice(0, itemSize * (halfIdx + 1));
        
        //remove all but the first and last vertices of the first split from the second
        second.splice(itemSize, first.length - 2 * itemSize);
        
        //  
        //  4 + 1
        //  3   2  
        //
        var toAddFirst = Help.Center( [ first[0], first[1], first[2], first[first.length - 3], first[first.length - 2], first[first.length - 1] ], itemSize);
        first.push(toAddFirst[0], toAddFirst[1], toAddFirst[2]);
        
        //  
        //  3   4
        //  2 + 1  
        //
        var toAddSecond = Help.Center( second.slice(0, 2 * itemSize), itemSize);
        second.splice(itemSize, 0, toAddSecond[0], toAddSecond[1], toAddSecond[2]);
        
        return [ new LineLoop(gl, itemSize, first), new LineLoop(gl, itemSize, second) ];
    }
}
