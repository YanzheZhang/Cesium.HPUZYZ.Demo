var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
     'void main() {\n' +
     '  gl_Position = a_Position;\n' +
     '  gl_PointSize = 20.0;\n' +
     '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'void main() {\n' +
  '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' + // 中心点(0.5, 0.5)
  '  if(d < 0.3) {\n' +  //  
  '    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '  } else if(d < 0.5){\n' +
  '    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n' +
  '  } else { discard; }\n' +
  '}\n';


function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // 设置顶点缓冲区
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

   
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
      0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = 3; //  

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
  
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(a_Position);

    return n;
}