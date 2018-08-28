
var PrimitivePolyline=(
    function () {
        var vertexShader;
        var fragmentShader;
        //var geometry;
        //var appearance;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = getVS();
            fragmentShader = getFS();
            if (options.Cartesians && options.Cartesians.length >= 2) {
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

            } else { 
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
           
            this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
            this.appearance = CreateAppearence(fragmentShader, vertexShader);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: this.geometry
                }),
                appearance: this.appearance,
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
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  
                    depthTest: { enabled: true }, 
                    depthMask: true,
                    lineWidth: 4.0
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function getVS() {
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
            }\
            ";
        }
        function getFS() {
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
                this.positionArr = null;
                this.colorArr = null;
                this.indiceArr = null;
                this.geometry = null;
                this.appearance = null;
                this.primitive = null;
            }
        }
        _.prototype.updateCartesianPosition = function (cartesians) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
               
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

                this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                this.appearance = CreateAppearence(fragmentShader, vertexShader);

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.geometry
                    }),
                    appearance: this.appearance,
                    asynchronous: false
                }));
            } else { return;}
        }
        _.prototype.updateCartesianPositionColor = function (cartesians, colors) {
            if (colors.length === cartesians.length * 4) { } else { return; }
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
          
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

                this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                this.appearance = CreateAppearence(fragmentShader, vertexShader);
           

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.geometry
                    }),
                    appearance: this.appearance,
                    asynchronous: false
                }));
            } else { return; }
        }
        return _;
    })();