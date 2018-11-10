//顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
     'void main() {\n' +
     '  gl_Position = a_Position;\n' +
     '  gl_PointSize = 20.0;\n' +
     '}\n';
//片元着色器
var FSHADER_SOURCE =
 // '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
 // '#endif\n' +
  'void main() {\n' +
  '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' + // 中心点(0.5, 0.5)
  '  if(d < 0.3) {\n' +  //  
  '    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '  } else if(d < 0.5){\n' +
  '    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n' +
  '  } else { discard; }\n' +
  '}\n';


function main() {
    // 获取canvas容器
    var canvas = document.getElementById('webgl');
    //获取webgl上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // 初始化 shaders
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

    // 将背景清除为指定颜色 
    gl.clearColor(0, 0, 0, 1);
    // 清除
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制点
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
    //类型化数组
    var vertices = new Float32Array([
      0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = 3; //  

    // 创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 获取 attribute 
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // 将缓冲区对象分配给 a_Position
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // 解除绑定
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 连接 a_Position与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}