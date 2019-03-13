var PrimitiveWaterFace = (
    function () {
        var degreesArrayHeights;
        var fragmentShader;
        var normalMapUrl;
        var geometry;
        var appearance;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            fragmentShader = FSWaterFace();
            normalMapUrl = options.normalMapUrl;
            if (options.DegreesArrayHeights && options.DegreesArrayHeights.length >= 3) {
                degreesArrayHeights = options.DegreesArrayHeights;
                
            } else {
                degreesArrayHeights = [116.04437, 30.10932, -100,
                         116.04537, 30.10932, -120,
                         116.04537, 30.11032, -100,
                         116.04437, 30.11032, -120,
                         116.04437, 30.10932, -100];
            }      
            if (options.extrudedHeight) {
                geometry = CreateGeometry(degreesArrayHeights, options.extrudedHeight);
            } else {
                geometry = CreateGeometry(degreesArrayHeights);
            }
            
            appearance = CreateAppearence(fragmentShader, normalMapUrl);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                allowPicking: false,
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geometry
                }),
                appearance: appearance,
                asynchronous: false
            }));
        }
        //_degreesArrayHeights是一个组成多边形顶点数组[lon,lat,alt]
        function CreateGeometry(_degreesArrayHeights, _extrudedHeight) {
            return new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(_degreesArrayHeights)),
                extrudedHeight: _extrudedHeight?_extrudedHeight:0,
                perPositionHeight: true
            });
        }

        function CreateAppearence(fs, url) {
            return new Cesium.EllipsoidSurfaceAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: 'Water',
                        uniforms: {
                            normalMap: url,
                            frequency: 1000.0,
                            animationSpeed: 0.05,
                            amplitude: 10.0
                        }
                    }
                }),
                fragmentShaderSource: fs
            });
        }
         
        function FSWaterFace() {
            return 'varying vec3 v_positionMC;\n\
varying vec3 v_positionEC;\n\
varying vec2 v_st;\n\
\n\
void main()\n\
{\n\
    czm_materialInput materialInput;\n\
    vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n\
#ifdef FACE_FORWARD\n\
    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n\
#endif\n\
    materialInput.s = v_st.s;\n\
    materialInput.st = v_st;\n\
    materialInput.str = vec3(v_st, 0.0);\n\
    materialInput.normalEC = normalEC;\n\
    materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n\
    vec3 positionToEyeEC = -v_positionEC;\n\
    materialInput.positionToEyeEC = positionToEyeEC;\n\
    czm_material material = czm_getMaterial(materialInput);\n\
#ifdef FLAT\n\
    gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n\
#else\n\
    gl_FragColor = czm_phong(normalize(positionToEyeEC), material);\n\
    gl_FragColor.a = 0.5;\n\
#endif\n\
}\n\
';
        }

        _.prototype.remove = function () {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                this.primitive = null;
            }
        }
        _.prototype.updateDegreesPosition = function (_degreesArrayHeights, _extrudedHeight) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (_degreesArrayHeights && _degreesArrayHeights.length < 3) { return; }
                geometry = CreateGeometry(_degreesArrayHeights, _extrudedHeight?_extrudedHeight:0);
               
                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    allowPicking: false,
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