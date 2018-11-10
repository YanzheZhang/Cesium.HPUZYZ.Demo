//顶点着色器
var VSHADER_SOURCE =
  'void main() {\n' +
  '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + //顶点位置
  '  gl_PointSize = 10.0;\n' +                   
  '}\n';

//片元着色器
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + //顶点颜色
  '}\n';

function main() {
    //获取canvas容器
    var canvas = document.getElementById('webgl');
    //获取webgl上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // 初始化 着色器程序对象
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // 将背景清除为指定颜色 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清除
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制点
    gl.drawArrays(gl.POINTS, 0, 1);
}