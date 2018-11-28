var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  gl_PointSize = 50.0;\n' +
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
// 
var OFFSCREEN_WIDTH = 256;
var OFFSCREEN_HEIGHT = 256;
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_modelMatrixFBO = new Matrix4();
var g_mvpMatrixFBO = new Matrix4();
var x_in_canvas, y_in_canvas;
var picked = false;
var canvas;

function main() {
    canvas = document.getElementById('webgl');
    OFFSCREEN_WIDTH = canvas.width;
    OFFSCREEN_HEIGHT = canvas.height;

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    var program = gl.program;
    program.a_Position = gl.getAttribLocation(program, 'a_Position');
    program.a_Color = gl.getAttribLocation(program, 'a_Color');
    program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    if (program.a_Position < 0 || program.a_Color < 0 || !program.u_MvpMatrix) {
        console.log('Failed to get the storage location of a_Position, a_TexCoord, u_MvpMatrix');
        return;
    }
    var pointsFBO = initVertexBuffersFBO(gl);
    var points = initVertexBuffers(gl);
    if (!points) { 
        console.log('Failed to set the vertex information');
        return;
    }
    // 初始化帧缓冲区对象 (FBO)
    var fbo = initFramebufferObject(gl);
    if (!fbo) {
        console.log('Failed to intialize the framebuffer object (FBO)');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);//消隐功能 不绘制背面
    var viewProjMatrix = new Matrix4();   //为颜色缓冲区准备
    viewProjMatrix.setPerspective(30, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var viewProjMatrixFBO = new Matrix4();   //为帧缓冲区准备
    viewProjMatrixFBO.setPerspective(30.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);
    viewProjMatrixFBO.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var currentAngle = 0.0; 
    var tick = function () {
        if (picked) {
            drawPointFBO(gl, gl.program, canvas, fbo, pointsFBO, currentAngle, viewProjMatrixFBO);
            var pixels = getFixels(gl, x_in_canvas, y_in_canvas);
            alert(pixels);
            picked = false;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);//必须在getFixels后执行，否则gl被切换回颜色缓冲区
        }
        drawPoint(gl, gl.program, canvas, points, currentAngle, viewProjMatrix);
        window.requestAnimationFrame(tick, canvas);
    };
    tick();
    canvas.onmousedown = function (ev) {  
        var x = ev.clientX, y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            x_in_canvas = x - rect.left;
            y_in_canvas = rect.bottom - y;
            picked = true;
        }
    }
}

function initVertexBuffersFBO(gl) {
    var vertices = new Float32Array([
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0  
    ]);
    var colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0]);
    var indices = new Uint8Array([0, 1, 2, 3]);
    var o = new Object();
    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 4, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null;
    o.numIndices = indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return o;
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0,
      0.0, 0.0, 0.0   
    ]);
    var colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0]);
    var indices = new Uint8Array([0, 1, 2, 3, 4]);
    var o = new Object(); 
    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 4, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null;
    o.numIndices = indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return o;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    buffer.num = num;
    buffer.type = type;
    return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    buffer.type = type;
    return buffer;
}

function initFramebufferObject(gl) {
    var framebuffer, texture, depthBuffer;
    var error = function () {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }
    //创建帧缓冲区
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }
    //创建纹理对象并设置其尺寸和参数
    texture = gl.createTexture(); 
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture); 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    framebuffer.texture = texture; 
    //创建渲染缓冲区对象并设置其尺寸和参数
    depthBuffer = gl.createRenderbuffer(); 
    if (!depthBuffer) {
        console.log('Failed to create renderbuffer object');
        return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    //将纹理和渲染缓冲区对象关联到帧缓冲区对象上
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    return framebuffer;
}

function draw(gl, canvas, fbo, points, pointsFBO, angle, viewProjMatrix, viewProjMatrixFBO, picked) {
    if (picked) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);            
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT); 
        gl.clearColor(0.2, 0.2, 0.4, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawPointFBO(gl, gl.program, pointsFBO, angle, viewProjMatrixFBO); 
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
    }
    gl.viewport(0, 0, canvas.width, canvas.height); 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawPoint(gl, gl.program, points, angle, viewProjMatrix); 
}

function drawPointFBO(gl, program, canvas, fbo, pointsFBO, angle, viewProjMatrix) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);          
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    g_mvpMatrixFBO.set(viewProjMatrix);
    g_mvpMatrixFBO.multiply(g_modelMatrixFBO);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrixFBO.elements);
    drawObject(gl, program, pointsFBO);
}

function drawPoint(gl, program, canvas, points, angle, viewProjMatrix) {
    gl.viewport(0, 0, canvas.width, canvas.height); 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);
    drawObject(gl, program, points);
}

function drawObject(gl, program, o) {
    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
    initAttributeVariable(gl, program.a_Color, o.colorBuffer); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
    gl.drawElements(gl.POINTS, o.numIndices, o.indexBuffer.type, 0);
}

function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

var ANGLE_STEP = 3;
var last = Date.now();
function animate(angle) {
    var now = Date.now();
    var elapsed = now - last;
    last = now;
    var newAngle = angle + (ANGLE_STEP * elapsed) / 10000.0;
    return newAngle % 360;
}
function getFixels(gl, x, y) {
    var pixels = new Uint8Array(4); 
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
}