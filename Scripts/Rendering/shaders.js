function CreateSimpleShader(gl)
{
    var basicVertexShader = document.getElementById("simpleVertex").firstChild.nodeValue;
    var basicFragmentShader = document.getElementById("simpleFragment").firstChild.nodeValue;
    return _CreateShader(gl, basicVertexShader, basicFragmentShader);
}

//private helper functions ahead

function _CreateProgram(gl, vs_source, fs_source)
{
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vs_source);
    gl.compileShader(vs);
    
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fs_source);
    gl.compileShader(fs);
    
    var program = gl.createProgram();
    gl.attachShader(program , vs);
    gl.attachShader(program , fs);
    gl.linkProgram(program);
    
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) 
	    console.log(gl.getShaderInfoLog(vs));

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) 
    	console.log(gl.getShaderInfoLog(fs));
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    	console.log(gl.getProgramInfoLog(program));
    	
   	return program;
}


function _CreateShader(gl, vs_source, fs_source)
{
    var program = _CreateProgram(gl, vs_source, fs_source);
    	
    gl.useProgram(program);
    	
    program.UniformModelView = gl.getUniformLocation(program, "modelView");
    program.UniformProjection = gl.getUniformLocation(program, "projection");
    program.UniformColor = gl.getUniformLocation(program, "color");
    program.AttribPos = gl.getAttribLocation(program, "pos");
    
// Helper methods
    program.SetWorld = function SetWorld(mat)
    {
        gl.uniformMatrix4fv(program.UniformModelView , false, mat);
    }
    
    program.SetProjection = function SetProjection(mat)
    {
        gl.uniformMatrix4fv(program.UniformProjection, false, mat);
    }
    
    program.SetColor = function SetColor(color)
    {
        gl.uniform4fv(program.UniformColor, color);
    }

//Initialization
    var ModelView = mat4.create();
    mat4.identity(ModelView);
    program.SetWorld(ModelView);

    var Projection = mat4.create();
    mat4.ortho(-1, 1, -1, 1, -1, 1, Projection);
    program.SetProjection(Projection);
    
    program.SetColor([1.0, 1.0, 1.0, 1.0]);
    
    return program;
}