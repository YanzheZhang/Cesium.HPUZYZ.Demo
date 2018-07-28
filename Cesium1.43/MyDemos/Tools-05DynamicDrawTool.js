/*
 *动态绘制工具
 *包括点线面
 *在绘制结束后，返回结果坐标值
 */
var DynamicDrawTool = (function () {
    var mouseHandlerDraw;
    var ellipsoid = Cesium.Ellipsoid.WGS84;

    function _() { }

    ChangeablePrimitive = (function () {
        function _() {
        }

        _.prototype.initialiseOptions = function (options) {
            fillOptionsDraw(this, options);

            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        };

        _.prototype.setAttribute = function (name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function (name) {
            return this[name];
        };

        /**
         * @private
         */
        _.prototype.update = function (context, frameState, commandList) {

            if (!Cesium.defined(this.ellipsoid)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance)) {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== this.ellipsoid) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }
                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },

                                lineWidth: Math.min(this.strokeWidth, 4.0)// Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function () {
            return false;
        };

        _.prototype.destroy = function () {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };

        _.prototype.setStrokeStyle = function (strokeColor, strokeWidth) {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        };
        return _;
    })();

    PolylinePrimitive = (function () {
        var materialLine = Cesium.Material.fromType(Cesium.Material.ColorType);
        materialLine.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
        var defaultShapeOptions = {
            ellipsoid: Cesium.Ellipsoid.WGS84,
            textureRotationAngle: 0.0,
            height: 0.0,
            asynchronous: true,
            show: true,
            debugShowBoundingVolume: false
        };
        var defaultPolylineOptions = copyOptionsDraw(defaultShapeOptions, {
            width: 5,
            geodesic: true,
            granularity: 10000,
            appearance: new Cesium.PolylineMaterialAppearance({
                aboveGround: false
            }),
            material: materialLine
        });

        function _(options) {
            options = copyOptionsDraw(options, defaultPolylineOptions);

            this.initialiseOptions(options);
        }
        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };
        _.prototype.setWidth = function (width) {
            this.setAttribute('width', width);
        };
        _.prototype.setGeodesic = function (geodesic) {
            this.setAttribute('geodesic', geodesic);
        };
        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };
        _.prototype.getWidth = function () {
            return this.getAttribute('width');
        };
        _.prototype.getGeodesic = function (geodesic) {
            return this.getAttribute('geodesic');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.positions) || this.positions.length < 2) {
                return;
            }
            return new Cesium.PolylineGeometry({
                positions: this.positions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid
            });
        };
        return _;
    })();

    PolygonPrimitive = (function () {
        var materialSurface = Cesium.Material.fromType(Cesium.Material.ColorType);
        materialSurface.uniforms.color = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
        var defaultShapeOptions = {
            ellipsoid: Cesium.Ellipsoid.WGS84,
            textureRotationAngle: 0.0,
            height: 0.0,
            asynchronous: true,
            show: true,
            debugShowBoundingVolume: false
        };
        var defaultSurfaceOptions = copyOptionsDraw(defaultShapeOptions, {
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: false
            }),
            material: materialSurface,
            granularity: Math.PI / 180.0
        });
        var defaultPolygonOptions = copyOptionsDraw(defaultSurfaceOptions, {});
        function _(options) {
            options = copyOptionsDraw(options, defaultPolygonOptions);
            this.initialiseOptions(options);
            this.isPolygon = true;
        }

        _.prototype = new ChangeablePrimitive();//继承
        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };
        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }
            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function () {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        };
        return _;
    })();

    function getDisplayLatLngString(cartographic, precision) {
        return Cesium.Math.toDegrees(cartographic.longitude).toFixed(precision || 3) + ", " + Cesium.Math.toDegrees(cartographic.latitude).toFixed(precision || 3);
    }
    function cloneObjDraw(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? cloneObjDraw(from[name], null) : to[name];
        }

        return to;
    }
    function copyOptionsDraw(options, defaultOptions) {
        var newOptions = cloneObjDraw(options), option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = cloneObjDraw(defaultOptions[option]);
            }
        }
        return newOptions;
    }
    function fillOptionsDraw(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = cloneObjDraw(defaultOptions[option]);
            }
        }
    }

    _.startDrawingMarker = function (viewer, msg, callback) {

        //var _self = this;
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        CesiumTooltip.initTool(viewer);

        // Now wait for start
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    //if (callback) {
                    if (typeof callback == 'function') {
                        callback(cartesian);
                    }
                }
                if (mouseHandlerDraw) {
                    mouseHandlerDraw.destroy();
                    mouseHandlerDraw = null;
                }
                if (CesiumTooltip) {
                    CesiumTooltip.setVisible(false);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    CesiumTooltip.showAt(position, msg + "\n位置:" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
                } else {
                    CesiumTooltip.showAt(position, msg);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    };
    _.startDrawingPolyshape = function (viewer, isPolygon, PolyOption, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        CesiumTooltip.initTool(viewer);

        var minPoints = isPolygon ? 3 : 2;
        var primitives = scene.primitives;
        var poly;
        if (isPolygon) {
            poly = new PolygonPrimitive(PolyOption);
        } else {
            poly = new PolylinePrimitive(PolyOption);
        }
        poly.asynchronous = false;
        primitives.add(poly);
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    // first click
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    }
                    if (positions.length >= minPoints) {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                    }

                    positions.push(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    CesiumTooltip.showAt(position, "点击添加第一个点");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        positions.pop();
                        // make sure it is slightly different
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        if (positions.length === 2) {
                            CesiumTooltip.showAt(position, "点击添加第二个点");
                        } else {
                            CesiumTooltip.showAt(position, "双击结束编辑");
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandlerDraw.setInputAction(function (movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        //_self.stopDrawing();
                        if (typeof callback == 'function') {
                            //positions.push(cartesian);
                            callback(positions);
                        }
                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        if (CesiumTooltip) {
                            CesiumTooltip.setVisible(false);
                        }
                        if (poly) {
                            primitives.remove(poly);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };

    return _;
})();

/*
 *提示框工具
 *entity方式
 */
var CesiumTooltip = (function () {
    var isInit = false;
    var viewer;
    var labelEntity;

    function _() { };

    _.initTool = function (_viewer) {
        if (isInit) { return; }
        viewer = _viewer;
        labelEntity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(0, 0),
            label: {
                text: '提示',
                font: '15px sans-serif',
                pixelOffset: new Cesium.Cartesian2(8, 8),//y大小根据行数和字体大小改变
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                showBackground: true,
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 1.0)
            }
        });
        labelEntity.show = false;
        isInit = true;
    }

    _.setVisible = function (visible) {
        if (!isInit) { return; }
        labelEntity.show = visible ? true : false;
    };

    _.showAt = function (position, message) {
        if (!isInit) { return; }
        if (position && message) {
            labelEntity.show = true;
            var cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);// 
            if (cartesian) {
                labelEntity.position = cartesian;
                labelEntity.show = true;
                labelEntity.label.text = message;
            } else {
                labelEntity.show = false;
            }
        }
    };

    return _;
})();