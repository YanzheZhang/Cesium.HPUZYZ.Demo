var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変量
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
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

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // 获取uniform变量 u_FragColor存储位置
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //注册点击事件
    canvas.onmousedown = function (ev) { click(ev, gl, canvas, a_Position, u_FragColor) };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];  // 存储顶点
var g_colors = [];  // 存储颜色
function click(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX;//点击位置  
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    // 存储顶点
    g_points.push([x, y]);
    // 存储颜色
    if (x >= 0.0 && y >= 0.0) {      //第一象限
        g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    } else if (x < 0.0 && y < 0.0) { // 第三象限
        g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    } else {                         // 其它
        g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    }

    // 重绘
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (var i = 0; i < len; i++) {
        var xy = g_points[i];
        var rgba = g_colors[i];

        // 将顶点位置传输给 attribute变量 a_Position
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // 将顶点颜色传输给 uniform变量 u_FragColor
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
