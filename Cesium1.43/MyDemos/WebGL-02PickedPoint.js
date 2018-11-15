var VSHADER_SOURCE =
     'attribute vec4 a_Position;\n' +
     'attribute vec3 a_Color;\n' +
     'varying vec3 v_Color;\n' +
     'void main() {\n' +
     '  gl_Position = a_Position;\n' +
     '  gl_PointSize = 20.0;\n' +
     '  v_Color = a_Color;\n' +
     '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec3 v_Color;\n' +
  'void main() {\n' +
  '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' +  
  '  if(d < 0.5){\n' +
  '    gl_FragColor = vec4(v_Color.r/255.0,v_Color.g/255.0,v_Color.b/255.0, 1.0);\n' +
  '  } else { discard; }\n' +
  '}\n';

function defaultValue(a, b) {
    if (a !== undefined) {
        return a;
    }
    return b;
}

function PickedPoint(options) {
    this.id = parseInt(Math.random() * 1000);
    this.position = defaultValue(options.position, [Math.random(), Math.random()]);
    this.pickColor = defaultValue(options.pickColor, [parseInt(Math.random() * 255.0), parseInt(Math.random() * 255.0), parseInt(Math.random() * 255.0)]);
    this.color = defaultValue(options.color, [parseInt(Math.random() * 255.0), parseInt(Math.random() * 255.0), parseInt(Math.random() * 255.0)]);
}

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

    //
    var p1 = new PickedPoint({ color: [51, 0.0, 0.0], pickColor: [0.0, 51, 0.0] });
    var p2 = new PickedPoint({ color: [127, 0.0, 0.0], pickColor: [0.0, 127, 0.0] });
    var p3 = new PickedPoint({ color: [208, 0.0, 0.0], pickColor: [0.0, 208, 0.0] });
    var vertices = new Float32Array([
      p1.position[0], p1.position[1],
      p2.position[0], p2.position[1],
      p3.position[0], p3.position[1]
    ]);
    var n = 3; // The number of vertices

    var colors = new Float32Array([
      p1.color[0], p1.color[1], p1.color[2],
      p2.color[0], p2.color[1], p2.color[2],
      p3.color[0], p3.color[1], p3.color[2],
    ]);

    var colorsPicked = new Float32Array([
     p1.pickColor[0], p1.pickColor[1], p1.pickColor[2],
     p2.pickColor[0], p2.pickColor[1], p2.pickColor[2],
     p3.pickColor[0], p3.pickColor[1], p3.pickColor[2],
    ]);

    Draw(gl, n, vertices, colors);

    //注册点击事件
    canvas.onmousedown = function (ev) { 
        var x = ev.clientX, y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            Draw(gl, n, vertices, colorsPicked);
            var pixels = getFixels(gl, x_in_canvas, y_in_canvas);
            var pickedObj = check([p1, p2, p3], pixels);
            if (pickedObj) alert('The cube was selected! ' + pickedObj.id);
            Draw(gl, n, vertices, colors);
        }
    }
}

function Draw(gl, n, vertices, colors) {
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


    // 
    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(a_Color);

    //
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
}

//获取点基础像素值
function getFixels(gl, x, y) {
    //
    var pixels = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
}
//判断是否选中物体
function check(ps, pixels) {
    for (var i = 0; i < ps.length; i++) {
        var r = ps[i].pickColor[0];
        var g = ps[i].pickColor[1];
        var b = ps[i].pickColor[2];
        if (r == pixels[0] && g == pixels[1] && b == pixels[2]) {
            return ps[i];
        }
    }
    return null;
}
