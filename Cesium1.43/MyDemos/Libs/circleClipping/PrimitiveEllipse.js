/*
  绘制椭圆
  当a=b时是圆（笛卡尔坐标系下正圆）
*/
var PrimitiveEllipse = (
    function () {
        var positionArr = [];
        var colorArr = [];
        var indiceArr = [];
        var vertexShader;
        var fragmentShader;
        var geometry;
        var appearance;
        var viewer;
        var ellipsoid = Cesium.Ellipsoid.WGS84;
        function _(options) {
            viewer = options.viewer;
            vertexShader = VSPolylie();
            fragmentShader = FSPolyline(); //Cartographic  Cartesian
            if (options.center) {

                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                var height = options.height ? options.height:0 ;
                var slices = options.slices && options.slices >= 36 ? options.slices : 360;// 
                var semiMinorAxis = options.semiMinorAxis;
                var semiMajorAxis = options.semiMajorAxis;
                var rotation = Cesium.Math.toRadians(options.rotation);
                var eopt = {};
                eopt.semiMinorAxis = semiMinorAxis;
                eopt.semiMajorAxis = semiMajorAxis;
                eopt.rotation = rotation;
                eopt.center = Cesium.Cartesian3.fromRadians(options.center.longitude, options.center.latitude, height);
                eopt.granularity = Math.PI * 2.0 / parseFloat(slices);
                var ellipse = EllipseGeometryLibraryEx.computeEllipsePositions(eopt, false);
                var raiseopt={};
                raiseopt.ellipsoid=ellipsoid;
                raiseopt.height=height;
                raiseopt.extrudedHeight=0;

                ellipse.positions = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positions, raiseopt, false);
                ellipse.positionsdown = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positionsdown, raiseopt, false);
                //上半部
                for (var i = 0; i < ellipse.positions.length; i = i + 3) {
                    postionsTemp.push(ellipse.positions[i]);
                    postionsTemp.push(ellipse.positions[i + 1]);
                    postionsTemp.push(ellipse.positions[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 1; i < ellipse.positions.length / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //下半部
                for (var i = 0; i < ellipse.positionsdown.length; i = i + 3) {
                    postionsTemp.push(ellipse.positionsdown[i]);
                    postionsTemp.push(ellipse.positionsdown[i + 1]);
                    postionsTemp.push(ellipse.positionsdown[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = ellipse.positions.length / 3 +1; i < ellipse.positionsdown.length*2 / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //接边缝隙
                //右缝隙
                indicesTesm.push(0);
                indicesTesm.push(ellipse.positions.length / 3);
                //左缝隙
                indicesTesm.push(ellipse.positions.length / 3-1);
                indicesTesm.push(ellipse.positionsdown.length * 2 / 3 -1);

                positionArr = new Float64Array(postionsTemp);
                colorArr = new Float32Array(colorsTemp);
                indiceArr = new Uint16Array(indicesTesm);

            } else {//if (options.CartographicCenter && options.CartographicPoint) {
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                ]);
                colorArr = new Float32Array([
                         0.0, 0.0, 1.0, 1.0,
                         0.0, 0.0, 1.0, 1.0
                ]);
                indiceArr = new Uint16Array([0, 1]);
            }

            geometry = CreateGeometry(positionArr, colorArr, indiceArr);
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
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  //混合
                    depthTest: { enabled: true }, //深度测试
                    depthMask: true
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
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

        _.prototype.updatePosition = function (options) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                //primitive = null;
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                var height = options.height ? options.height : 0;
                var slices = options.slices && options.slices >= 36 ? options.slices : 360;//默认72
                var semiMinorAxis = options.semiMinorAxis;
                var semiMajorAxis = options.semiMajorAxis;
                var rotation = Cesium.Math.toRadians(options.rotation);
                var eopt = {};
                eopt.semiMinorAxis = semiMinorAxis;
                eopt.semiMajorAxis = semiMajorAxis;
                eopt.rotation = rotation;
                eopt.center = Cesium.Cartesian3.fromRadians(options.center.longitude, options.center.latitude, height);
                eopt.granularity = Math.PI * 2.0 / parseFloat(slices);
                var ellipse = EllipseGeometryLibraryEx.computeEllipsePositions(eopt, false);

                var raiseopt = {};
                raiseopt.ellipsoid = ellipsoid;
                raiseopt.height = height;
                raiseopt.extrudedHeight = 0;

                ellipse.positions = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positions, raiseopt, false);
                ellipse.positionsdown = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positionsdown, raiseopt, false);
                //上半部
                for (var i = 0; i < ellipse.positions.length; i = i + 3) {
                    postionsTemp.push(ellipse.positions[i]);
                    postionsTemp.push(ellipse.positions[i + 1]);
                    postionsTemp.push(ellipse.positions[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 1; i < ellipse.positions.length / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //下半部
                for (var i = 0; i < ellipse.positionsdown.length; i = i + 3) {
                    postionsTemp.push(ellipse.positionsdown[i]);
                    postionsTemp.push(ellipse.positionsdown[i + 1]);
                    postionsTemp.push(ellipse.positionsdown[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = ellipse.positions.length / 3 + 1; i < ellipse.positionsdown.length * 2 / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //接边缝隙
                //右缝隙
                indicesTesm.push(0);
                indicesTesm.push(ellipse.positions.length / 3);
                //左缝隙
                indicesTesm.push(ellipse.positions.length / 3 - 1);
                indicesTesm.push(ellipse.positionsdown.length * 2 / 3 - 1);

                positionArr = new Float64Array(postionsTemp);
                colorArr = new Float32Array(colorsTemp);
                indiceArr = new Uint16Array(indicesTesm);
                geometry = CreateGeometry(positionArr, colorArr, indiceArr);

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