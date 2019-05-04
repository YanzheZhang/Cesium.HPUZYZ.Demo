
var PrimitivePolyline=(
    function () {
        //var positionArr = [];
        //var colorArr = [];
        //var indiceArr = [];
        var vertexShader;
        var fragmentShader;
        var geometry;
        var appearance;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = VSPolylie();
            fragmentShader = FSPolyline();
            if (options.Cartesians && options.Cartesians.length >= 2) {
                //positionArr = new Float64Array([
                //                    options.Cartesians[0].x, options.Cartesians[0].y, options.Cartesians[0].z,
                //                    options.Cartesians[1].x, options.Cartesians[1].y, options.Cartesians[1].z
                //]);
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                if (options.Colors && options.Colors.length === options.Cartesians.length * 4) {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                    }
                    colorsTemp = options.Colors;
                } else {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                        //
                        colorsTemp.push(0.0);
                        colorsTemp.push(0.0);
                        colorsTemp.push(1.0);
                        colorsTemp.push(1.0);
                    }
                }
                for (var i = 1; i < options.Cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

            } else { // if (options.Cartesians && options.Cartesians.length >= 2) {
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                this.positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                ]);
                //默认蓝色
                this.colorArr = new Float32Array([
                         0.0, 0.0, 1.0, 1.0,
                         0.0, 0.0, 1.0, 1.0
                ]);
                this.indiceArr = new Uint16Array([0, 1]);
            }
           
            geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
            appearance = CreateAppearence(fragmentShader, vertexShader);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geometry
                }),
                appearance: appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, colors, indices) {
            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    color: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 4,
                        values: colors
                    })
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.LINES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs) {
            return new Cesium.Appearance({
                //flat: true,          
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  //混合
                    depthTest: { enabled: true }, //深度测试
                    depthMask: true,
                    lineWidth: 4.0
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
            //return new Cesium.PerInstanceColorAppearance({
            //    flat: true,
            //    renderState: {
            //        depthTest: {
            //            enabled: true
            //        },

            //        lineWidth: 4.0 // Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
            //    },
            //    fragmentShaderSource: fs,
            //    vertexShaderSource: vs
            //})
        }

        function VSPolylie() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec4 color;\
            varying vec4 v_color;\
            attribute float batchId;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_color =color;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
                gl_PointSize=10.0;\
            }\
            ";
        }
        function FSPolyline() {
            return "varying vec4 v_color;\
            void main()\
            {\
                gl_FragColor =v_color;\
            }\
            ";
        }
       
        _.prototype.remove = function () {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                this.primitive = null;
            }
        }
        _.prototype.updateCartesianPosition = function (cartesians) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                //primitive = null;
                if (cartesians && cartesians.length < 2) { return; }
                if (cartesians.length === this.positionArr.length / 3) {
                    var p1 = cartesians[0];
                    var p2 = cartesians[1];
                    this.positionArr = new Float64Array([
                        p1.x, p1.y, p1.z,
                        p2.x, p2.y, p2.z
                    ]);
                    geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                    //appearance = CreateAppearence(fragmentShader, vertexShader);
                } else {
                    //默认蓝色
                    var postionsTemp = [];
                    var colorsTemp = [];
                    var indicesTesm = [];
                    for (var i = 0; i < cartesians.length; i++) {
                        postionsTemp.push(cartesians[i].x);
                        postionsTemp.push(cartesians[i].y);
                        postionsTemp.push(cartesians[i].z);
                         
                        colorsTemp.push(0.0);
                        colorsTemp.push(0.0);
                        colorsTemp.push(1.0);
                        colorsTemp.push(1.0);
                    }
                    for (var i = 1; i < cartesians.length; i++) {
                        indicesTesm.push(i - 1);
                        indicesTesm.push(i);
                    }
                    this.positionArr = new Float64Array(postionsTemp);
                    this.colorArr = new Float32Array(colorsTemp);
                    this.indiceArr = new Uint16Array(indicesTesm);

                    geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                    appearance = CreateAppearence(fragmentShader, vertexShader);
                }

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry
                    }),
                    appearance: appearance,
                    asynchronous: false
                }));
            } else { return;}
        }
        _.prototype.updateCartesianPositionColor = function (cartesians, colors) {
            if (colors.length === cartesians.length * 4) { } else { return; }
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                //primitive = null;
                if (cartesians && cartesians.length < 2) { return; }
                if (cartesians.length === this.positionArr.length / 3) {
                    var p1 = cartesians[0];
                    var p2 = cartesians[1];
                    this.positionArr = new Float64Array([
                        p1.x, p1.y, p1.z,
                        p2.x, p2.y, p2.z
                    ]);
                    
                    this.colorArr = new Float32Array(colors);
                     
                    geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                    //appearance = CreateAppearence(fragmentShader, vertexShader);
                } else {
                    var postionsTemp = [];
                    var indicesTesm = [];
                    
                    for (var i = 0; i < cartesians.length; i++) {
                        postionsTemp.push(cartesians[i].x);
                        postionsTemp.push(cartesians[i].y);
                        postionsTemp.push(cartesians[i].z);
                    }
                    for (var i = 1; i < cartesians.length; i++) {
                        indicesTesm.push(i - 1);
                        indicesTesm.push(i);
                    }
                    this.positionArr = new Float64Array(postionsTemp);
                    this.colorArr = new Float32Array(colors);
                    this.indiceArr = new Uint16Array(indicesTesm);

                    geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                    appearance = CreateAppearence(fragmentShader, vertexShader);
                }

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry
                    }),
                    appearance: appearance,
                    asynchronous: false
                }));
            } else { return; }
        }
        return _;
    })();