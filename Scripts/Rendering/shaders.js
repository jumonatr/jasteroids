function CreateSimpleShader()
{
    return _CreateShader("simpleVertex", "simpleFragment");
}

//private helper functions ahead

//http://learningwebgl.com/blog/?p=28
function GetShader(id)
{
  var shaderScript = document.getElementById(id);
  if (!shaderScript)
      return null;

  var str = "";
  var k = shaderScript.firstChild;
  while (k)
  {
      if (k.nodeType == 3)
          str += k.textContent;

      k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
      return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
      alert(gl.getShaderInfoLog(shader));
      return null;
  }

  return shader;
}

function _CreateProgram(vs_source_id, fs_source_id)
{
    var vs = GetShader(vs_source_id);
    var fs = GetShader(fs_source_id);
    
    var program = gl.createProgram();
    gl.attachShader(program , vs);
    gl.attachShader(program , fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    	console.log(gl.getProgramInfoLog(program));
    	
   	return program;
}


function _CreateShader(vs_source_id, fs_source_id)
{
    var program = _CreateProgram(vs_source_id, fs_source_id);
    	
    gl.useProgram(program);
    	
    program.UniformModelView = gl.getUniformLocation(program, "modelView");
    program.UniformProjection = gl.getUniformLocation(program, "projection");
    program.UniformColor = gl.getUniformLocation(program, "color");
    program.AttribPos = gl.getAttribLocation(program, "pos");
    
// Helper methods
    program.Enable = function()
    {
        gl.useProgram(this);
    }

    program.SetWorld = function(mat)
    {
        gl.uniformMatrix4fv(this.UniformModelView , false, mat);
    }
    
    program.SetProjection = function(mat)
    {
        gl.uniformMatrix4fv(this.UniformProjection, false, mat);
    }
    
    program.SetColor = function(color)
    {
        gl.uniform4fv(this.UniformColor, color);
    }

//Initialization
    var ModelView = mat4.create();
    mat4.identity(ModelView);
    program.SetWorld(ModelView);

    var Projection = mat4.create();
    mat4.ortho(-1, 1, -1, 1, -1, 1, Projection);
    program.SetProjection(Projection);
    
    program.SetColor([1.0, 1.0, 0.0, 1.0]);
    
    return program;
}