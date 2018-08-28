
var PrimitiveTexture= (
    function () {
        var vertexShader;
        var fragmentShader;
        var materialShader;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = getVS();
            fragmentShader = getFS();
            materialShader = getMS();
            url = options.url ? options.url : 'sampledata/images/texture1';
            if (options.Cartesians && options.Cartesians.length >= 3) {
                var postionsTemp = [];
                var stsTemp = [];
                var indicesTesm = [];
                 
                for (var i = 0; i < options.Cartesians.length; i++) {
                    postionsTemp.push(options.Cartesians[i].x);
                    postionsTemp.push(options.Cartesians[i].y);
                    postionsTemp.push(options.Cartesians[i].z);
                }
                for (var i = 0; i < options.Cartesians.length; i+=3) {
                    indicesTesm.push(i);
                    indicesTesm.push(i+1);
                    indicesTesm.push(i + 2);

                    stsTemp.push(0);
                    stsTemp.push(1);
                    stsTemp.push(1);
                    stsTemp.push(1);
                    stsTemp.push(1);
                    stsTemp.push(0);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.sts = new Uint8Array(stsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

            } else { 
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                var p3 = Cesium.Cartesian3.fromDegrees(0.001, 0.001, -10);
                this.positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z,
                    p3.x, p3.y, p3.z
                ]);
                this.sts = new Uint8Array([0, 1,
                                           1, 1,
                                           1, 0]);
                this.indiceArr = new Uint16Array([0,1,2]);
            }
           
            this.geometry = CreateGeometry(this.positionArr, this.sts, this.indiceArr);
            this.appearance = CreateAppearence(fragmentShader, vertexShader,materialShader,url);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: this.geometry
                }),
                appearance: this.appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, sts, indices) {
            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    st: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 2,
                        values: sts
                    })
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs,ms,url) {
            return new Cesium.Appearance({
                material: new Cesium.Material({
                    fabric: {
                        uniforms: {
                            image: url
                        },
                        source: ms
                    }
                }),
                aboveGround: true,
                faceForward: true,
                flat: true,
                translucent: false,
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  
                    depthTest: { enabled: true }, 
                    depthMask: true,
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function getVS() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec2 st;\
            attribute float batchId;\
            varying vec2 v_st;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_st=st;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
            }\
            ";
        }
        function getFS() {
            return "varying vec2 v_st;\
            void main()\
            {\
                czm_materialInput materialInput;\
                czm_material material=czm_getMaterial(materialInput,v_st);\
                vec4 color=vec4(material.diffuse + material.emission,material.alpha);\
                if(color.x==1.0&&color.y==1.0&&color.z==1.0&&color.w==1.0) color=vec4(vec3(0.0,0.0,0.0),0.0);\
                gl_FragColor =color;\
            }\
            ";
        }
        function getMS() {
            return "czm_material czm_getMaterial(czm_materialInput materialInput,vec2 v_st)\
            {\
                vec4 color = texture2D(image, v_st);\
                czm_material material = czm_getDefaultMaterial(materialInput);\
                material.diffuse= color.rgb;\
                material.alpha=color.a;\
                return material;\
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
        _.prototype.updateTexture = function (url) {
           
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);

                this.appearance = CreateAppearence(fragmentShader, vertexShader, materialShader, url);

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