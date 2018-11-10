var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform float u_TimeIndex;\n' +
     'void main() {\n' +
     '  gl_Position = a_Position;\n' +
     '  gl_PointSize = 5.0+u_TimeIndex*0.5;\n' +//当前点大小
     '}\n';

var FSHADER_SOURCE =
  // '#ifdef GL_ES\n' +   
  'precision mediump float;\n' +
  // '#endif\n' +
  'void main() {\n' +
  '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' +  
  '  if(d < 0.3) {\n' +   
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

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    var u_TimeIndex = gl.getUniformLocation(gl.program, 'u_TimeIndex');
    if (!u_TimeIndex) {
        console.log('Failed to get the storage location of u_TimeIndex');
        return;
    }
    gl.uniform1f(u_TimeIndex, 0.0);

    gl.clearColor(0, 0, 0, 1);

    //当前索引
    var currentIndex = 0.0;
    var tick = function () { 
        currentIndex += 1.0;//刷新一次就改变索引一次
        if (currentIndex >= 60.0) {
            currentIndex = 0.0;
        }
        draw(gl, n, u_TimeIndex, currentIndex);
        requestAnimationFrame(tick, canvas);//网页刷新时调用
    };
    tick();
}

function draw(gl, n, u_TimeIndex, currentIndex) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u_TimeIndex, currentIndex);
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