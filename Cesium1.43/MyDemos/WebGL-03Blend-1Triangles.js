var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
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

    gl.clearColor(0, 0, 0, 1);
    //开启深度检测
    gl.enable(gl.DEPTH_TEST);
    //-------------------------------------------
    gl.depthMask(false);//锁定用于进行隐藏面消除的深度缓冲区的写入操作，使之只读
    //开启混合功能
    gl.enable(gl.BLEND);
    //指定混合函数
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);// ONE_MINUS_SRC_ALPHA

    //
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ViewMatrix || !u_ProjMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix and/or u_ProjMatrix');
        return;
    }

    var viewMatrix = new Matrix4();
    window.onkeydown = function (ev) { keydown(ev, gl, n, u_ViewMatrix, viewMatrix); };
    var projMatrix = new Matrix4();
    projMatrix.setOrtho(-1, 1, -1, 1, 0, 2);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    draw(gl, n, u_ViewMatrix, viewMatrix);
    //-------------------------------------------
    gl.depthMask(true);//释放深度缓冲区，使之可读可写
}

function initVertexBuffers(gl) {
    //var verticesColors = new Float32Array([
    // //顶点坐标和颜色(RGBA)
    // 0.0, 0.5, -0.4, 1.0, 0.0, 0.0, 0.4, // The back red one
    //-0.5, -0.5, -0.4, 1.0, 0.0, 0.0, 0.4,
    // 0.5, -0.5, -0.4, 1.0, 0.0, 0.0, 0.4,

    // 0.5, 0.4, -0.2, 0.0, 1.0, 0.0, 0.4, // The middle green one
    //-0.5, 0.4, -0.2, 0.0, 1.0, 0.0, 0.4,
    // 0.0, -0.6, -0.2, 0.0, 1.0, 0.0, 0.4,
   
    // 0.0, 0.5, 0.0, 0.0, 0.0, 1.0, 0.4,  // The front blue one 
    //-0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.4,
    // 0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.4,
    //]);

    var verticesColors = new Float32Array([
    //顶点坐标和颜色(RGBA)
    0.5, 0.4, -0.2, 0.0, 1.0, 0.0, 0.4, // The middle green one
   -0.5, 0.4, -0.2, 0.0, 1.0, 0.0, 0.4,
    0.0, -0.6, -0.2, 0.0, 1.0, 0.0, 0.4,

    0.0, 0.5, 0.0, 0.0, 0.0, 1.0, 0.4,  // The front blue one 
   -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.4,
    0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.4,

     0.0, 0.5, -0.4, 1.0, 0.0, 0.0, 0.4, // The back red one
   -0.5, -0.5, -0.4, 1.0, 0.0, 0.0, 0.4,
    0.5, -0.5, -0.4, 1.0, 0.0, 0.0, 0.4,
    ]);

    var n = 9;

    var vertexColorbuffer = gl.createBuffer();
    if (!vertexColorbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 7, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
}

function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    if (ev.keyCode == 39) { // 右方向键
        g_EyeX += 0.01;
    } else
        if (ev.keyCode == 37) { // 左方向键
            g_EyeX -= 0.01;
        } else return;
    draw(gl, n, u_ViewMatrix, viewMatrix);
}

//视点
var g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 0.25;
function draw(gl, n, u_ViewMatrix, viewMatrix) {
    gl.depthMask(false);
    viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 0, 0, 0, 0, 1, 0);
    // 改变视图矩阵
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.depthMask(true);
}
