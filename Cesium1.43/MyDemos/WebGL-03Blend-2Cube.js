var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
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

var mvpMatrix;
//视点
var g_EyeX = 3, g_EyeY = 3, g_EyeZ = 7;
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //开启深度检测
    gl.enable(gl.DEPTH_TEST);

    ////-------------------------------------------
    //gl.depthMask(false);//锁定用于进行隐藏面消除的深度缓冲区的写入操作，使之只读
    //开启混合
    gl.enable(gl.BLEND);
    //设置混合函数
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }

    mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    //-------------------------------------------
    //gl.depthMask(true);//释放深度缓冲区，使之可读可写

    window.onkeydown = function (ev) { keydown(ev, gl, n, u_MvpMatrix); };
}

function initVertexBuffers(gl) {
    // 顶点数组
    var vertices = new Float32Array([   
       1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
       1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
       1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
      -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
       1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
    ]);
    // 颜色数组
    var colors = new Float32Array([     
        0.5, 0.5, 1.0, 0.4, 0.5, 0.5, 1.0, 0.4, 0.5, 0.5, 1.0, 0.4, 0.5, 0.5, 1.0, 0.4,  // v0-v1-v2-v3 front(blue)
        0.5, 1.0, 0.5, 0.4, 0.5, 1.0, 0.5, 0.4, 0.5, 1.0, 0.5, 0.4, 0.5, 1.0, 0.5, 0.4,  // v0-v3-v4-v5 right(green)
        1.0, 0.5, 0.5, 0.4, 1.0, 0.5, 0.5, 0.4, 1.0, 0.5, 0.5, 0.4, 1.0, 0.5, 0.5, 0.4,  // v0-v5-v6-v1 up(red)
        1.0, 1.0, 0.5, 0.4, 1.0, 1.0, 0.5, 0.4, 1.0, 1.0, 0.5, 0.4, 1.0, 1.0, 0.5, 0.4,  // v1-v6-v7-v2 left
        1.0, 1.0, 1.0, 0.4, 1.0, 1.0, 1.0, 0.4, 1.0, 1.0, 1.0, 0.4, 1.0, 1.0, 1.0, 0.4,  // v7-v4-v3-v2 down
        0.5, 1.0, 1.0, 0.4, 0.5, 1.0, 1.0, 0.4, 0.5, 1.0, 1.0, 0.4, 0.5, 1.0, 1.0, 0.4   // v4-v7-v6-v5 back
    ]);
    // 索引数组
    var indices = new Uint8Array([       
       0, 1, 2, 0, 2, 3,    // front
       4, 5, 6, 4, 6, 7,    // right
       8, 9, 10, 8, 10, 11,    // up
      12, 13, 14, 12, 14, 15,    // left
      16, 17, 18, 16, 18, 19,    // down
      20, 21, 22, 20, 22, 23     // back
    ]);

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer)
        return -1;
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
        return -1;
    if (!initArrayBuffer(gl, colors, 4, gl.FLOAT, 'a_Color'))
        return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}

function keydown(ev, gl, n, u_MvpMatrix) {
    if (ev.keyCode == 39) { // 右方向键
        g_EyeX += 0.2;
    } else
        if (ev.keyCode == 37) { // 左方向键
            g_EyeX -= 0.2;
        } else return;
    draw(gl, n, u_MvpMatrix);
}
function draw(gl, n, u_MvpMatrix) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, 0, 0, 0, 0, 1, 0);
   
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    gl.depthMask(true);//释放深度缓冲区，使之可读可写
}
