var ChangeablePrimitiveTool = (function () {
    // static variables
    var isCreat = false;
    var ellipsoid = Cesium.Ellipsoid.WGS84;
    var materialLine = Cesium.Material.fromType(Cesium.Material.ColorType);
    materialLine.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
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
    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false
        }),
        material: materialSurface,
        granularity: Math.PI / 180.0
    });

    var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
        width: 5,
        geodesic: true,
        granularity: 10000,
        appearance: new Cesium.PolylineMaterialAppearance({
            aboveGround: false
        }),
        material: materialLine
    });
    var defaultPolygonOptions = copyOptions(defaultSurfaceOptions, {});
    //编辑状态节点图标
    var defaultBillboard = {
        iconUrl: "./sampledata/images/dragIcon.png",
        shiftX: 0,
        shiftY: 0
    };
    var dragBillboard = {
        iconUrl: "./sampledata/images/dragIcon.png",
        shiftX: 0,
        shiftY: 0
    };
    var dragHalfBillboard = {
        iconUrl: "./sampledata/images/dragIconLight.png",
        shiftX: 0,
        shiftY: 0
    };

    var ChangeablePrimitive = (function () {
        function _() {
        }
        _.prototype.initialiseOptions = function (options) {
            fillOptions(this, options);

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
         * @private 每一帧都要更新
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

                this._primitive = new Cesium.GroundPolylinePrimitive({
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

    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }
    //补充属性
    function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }
    // shallow copy 深拷贝
    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options), option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function setListener(primitive, type, callback) {
        primitive[type] = callback;
    }

    function enhanceWithListeners(element) {
        element._listeners = {};

        element.addListener = function (name, callback) {
            this._listeners[name] = (this._listeners[name] || []);
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        };
        //注册事件
        element.executeListeners = function (event, defaultCallback) {
            if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++) {
                    this._listeners[event.name][index](event);
                }
            } else {
                if (defaultCallback) {
                    defaultCallback(event);
                }
            }
        }
    }

    /**
     * _构造函数
     * @param cesiumWidget
     * @private
     */
    function _(viewer) {
        this._scene = viewer.scene;
        //this._tooltip = createTooltip(viewer.cesiumWidget.container);
        TooltipDiv.initTool(viewer.cesiumWidget.container);
        this._surfaces = [];

        this.initialiseHandlers();
        this.enhancePrimitives();
        isCreat = true;
    }

    _.prototype.initialiseHandlers = function () {
        var scene = this._scene;
        var _self = this;
        // scene events
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        function callPrimitiveCallback(name, position) {
            if (_self._handlersMuted == true) return;
            var pickedObject = scene.pick(position);
            if (pickedObject && pickedObject.primitive && pickedObject.primitive[name]) {
                pickedObject.primitive[name](position);
            }
        }
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftClick', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //handler.setInputAction(
        //    function (movement) {
        //        callPrimitiveCallback('leftDoubleClick', movement.position);
        //    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('rightClick', movement.position);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        var mouseOutObject;
        handler.setInputAction(
            function (movement) {
                if (_self._handlersMuted == true) return;
                var pickedObject = scene.pick(movement.endPosition);
                if (mouseOutObject && (!pickedObject || mouseOutObject != pickedObject.primitive)) {
                    !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) && mouseOutObject.mouseOut(movement.endPosition);
                    mouseOutObject = null;
                }
                if (pickedObject && pickedObject.primitive) {
                    pickedObject = pickedObject.primitive;
                    if (pickedObject.mouseOut) {
                        mouseOutObject = pickedObject;
                    }
                    if (pickedObject.mouseMove) {
                        pickedObject.mouseMove(movement.endPosition);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftUp', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(
            function (movement) {
                callPrimitiveCallback('leftDown', movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    };

    //扩展属性 
    _.prototype.enhancePrimitives = function () {
        var changeablePrimitiveTool = this;
        Cesium.Billboard.prototype.setEditable = function () {

            if (this._editable) {
                return;
            }

            this._editable = true;

            var billboard = this;

            var _self = this;

            function enableRotation(enable) {
                changeablePrimitiveTool._scene.screenSpaceCameraController.enableRotate = enable;
            }

            setListener(billboard, 'leftDown', function (position) {
                // TODO - start the drag handlers here
                // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                function onDrag(position) {
                    billboard.position = position;
                    _self.executeListeners({ name: 'drag', positions: position });
                }
                function onDragEnd(position) {
                    handler.destroy();
                    enableRotation(true);
                    _self.executeListeners({ name: 'dragEnd', positions: position });
                }

                var handler = new Cesium.ScreenSpaceEventHandler(changeablePrimitiveTool._scene.canvas);

                handler.setInputAction(function (movement) {
                    //var cartesian = changeablePrimitiveTool._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                    //var cartesian = changeablePrimitiveTool.scene.pickPosition(movement.endPosition);

                    if (!!movement.endPosition) {
                        var ray = changeablePrimitiveTool._scene.camera.getPickRay(movement.endPosition);
                        var cartesian = changeablePrimitiveTool._scene.globe.pick(ray, changeablePrimitiveTool._scene);
                        //var cartesian = changeablePrimitiveTool._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        } else {
                            onDragEnd(cartesian);
                        }
                    }

                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                handler.setInputAction(function (movement) {
                    //onDragEnd(changeablePrimitiveTool._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    //onDragEnd(changeablePrimitiveTool.scene.pickPosition(movement.endPosition));
                    if (!!movement.endPosition) {
                        var ray = changeablePrimitiveTool._scene.camera.getPickRay(movement.endPosition);
                        var cartesian = changeablePrimitiveTool._scene.globe.pick(ray, changeablePrimitiveTool._scene);
                        onDragEnd(cartesian);
                        //onDragEnd(changeablePrimitiveTool._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }
                }, Cesium.ScreenSpaceEventType.LEFT_UP);

                enableRotation(false);

            });

            enhanceWithListeners(billboard);

        };

        function setHighlighted(highlighted) {

            var scene = changeablePrimitiveTool._scene;

            // if no change
            // if already highlighted, the outline polygon will be available
            if (this._highlighted && this._highlighted == highlighted) {
                return;
            }
            // disable if already in edit mode
            if (this._editMode === true) {
                return;
            }
            this._highlighted = highlighted;
            // highlight by creating an outline polygon matching the polygon points
            if (highlighted) {
                // make sure all other shapes are not highlighted
                changeablePrimitiveTool.setHighlighted(this);
                this._strokeColor = this.strokeColor;
                this.setStrokeStyle(Cesium.Color.fromCssColorString('white'), this.strokeWidth);
            } else {
                if (this._strokeColor) {
                    this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                } else {
                    this.setStrokeStyle(undefined, undefined);
                }
            }
        }

        function setEditMode(editMode) {
            // if no change
            if (this._editMode == editMode) {
                return;
            }
            // make sure all other shapes are not in edit mode before starting the editing of this shape
            changeablePrimitiveTool.disableAllHighlights();
            // display markers
            if (editMode) {
                changeablePrimitiveTool.setEdited(this);
                var scene = changeablePrimitiveTool._scene;
                var _self = this;
                // create the markers and handlers for the editing
                if (this._markers == null) {
                    var markers = new _.BillboardGroup(changeablePrimitiveTool, dragBillboard);
                    var editMarkers = new _.BillboardGroup(changeablePrimitiveTool, dragHalfBillboard);
                    // function for updating the edit markers around a certain point
                    function updateHalfMarkers(index, positions) {
                        // update the half markers before and after the index
                        var editIndex = index - 1 < 0 ? positions.length - 1 : index - 1;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                        editIndex = index;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                    }
                    function onEdited() {
                        //_self.executeListeners({ name: 'onEdited', positions: _self.positions });
                        _self.executeListeners({ name: 'onEdited', positions: _self.positions, objId: _self.objId });//添加对象id
                    }
                    var handleMarkerChanges = {
                        dragHandlers: {
                            onDrag: function (index, position) {
                                _self.positions[index] = position;
                                updateHalfMarkers(index, _self.positions);
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function (index, position) {
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        //onDoubleClick: function (index) {
                        //    if (_self.positions.length < 4) {
                        //        return;
                        //    }
                        //    // remove the point and the corresponding markers
                        //    _self.positions.splice(index, 1);
                        //    _self._createPrimitive = true;
                        //    markers.removeBillboard(index);
                        //    editMarkers.removeBillboard(index);
                        //    updateHalfMarkers(index, _self.positions);
                        //    onEdited();
                        //},
                        //tooltip: function () {
                        //    if (_self.positions.length > 3) {
                        //        return "双击移除结点";
                        //    }
                        //}
                        onRightClick: function (index) {
                            if (_self.positions.length < 4) {
                                return;
                            }
                            // remove the point and the corresponding markers
                            _self.positions.splice(index, 1);
                            _self._createPrimitive = true;
                            markers.removeBillboard(index);
                            editMarkers.removeBillboard(index);
                            updateHalfMarkers(index, _self.positions);
                            onEdited();
                        },
                        tooltip: function () {
                            if (_self.positions.length > 3) {
                                return "右击移除结点";
                            }
                        }
                    };
                    // add billboards and keep an ordered list of them for the polygon edges
                    markers.addBillboards(_self.positions, handleMarkerChanges);
                    this._markers = markers;
                    function calculateHalfMarkerPosition(index) {
                        var positions = _self.positions;
                        return ellipsoid.cartographicToCartesian(
                            new Cesium.EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
                                ellipsoid.cartesianToCartographic(positions[index < positions.length - 1 ? index + 1 : 0])).
                                interpolateUsingFraction(0.5)
                        );
                    }
                    var halfPositions = [];
                    var index = 0;
                    var length = _self.positions.length + (this.isPolygon ? 0 : -1);
                    for (; index < length; index++) {
                        halfPositions.push(calculateHalfMarkerPosition(index));
                    }
                    var handleEditMarkerChanges = {
                        dragHandlers: {
                            onDragStart: function (index, position) {
                                // add a new position to the polygon but not a new marker yet
                                this.index = index + 1;
                                _self.positions.splice(this.index, 0, position);
                                _self._createPrimitive = true;
                            },
                            onDrag: function (index, position) {
                                _self.positions[this.index] = position;
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function (index, position) {
                                // create new sets of makers for editing
                                markers.insertBillboard(this.index, position, handleMarkerChanges); //add by wfw
                                editMarkers.getBillboard(this.index - 1).position = calculateHalfMarkerPosition(this.index - 1);//add by wfw
                                editMarkers.insertBillboard(this.index, calculateHalfMarkerPosition(this.index), handleEditMarkerChanges);//add by wfw
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        tooltip: function () {
                            return "拖动创建新结点";
                        }
                    };
                    editMarkers.addBillboards(halfPositions, handleEditMarkerChanges);
                    this._editMarkers = editMarkers;
                    // add a handler for clicking in the globe
                    this._globeClickhandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                    this._globeClickhandler.setInputAction(
                        function (movement) {
                            var pickedObject = scene.pick(movement.position);
                            if (!(pickedObject && pickedObject.primitive)) {
                                _self.setEditMode(false);
                            }
                        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                    // set on top of the polygon
                    markers.setOnTop();
                    editMarkers.setOnTop();
                }
                this._editMode = true;
            } else {
                if (this._markers != null) {
                    this._markers.remove();
                    this._editMarkers.remove();
                    this._markers = null;
                    this._editMarkers = null;
                    this._globeClickhandler.destroy();
                }
                this._editMode = false;
            }

        }

        ChangeablePrimitiveTool.PolylinePrimitive.prototype.setEditable = function () {
            if (this.setEditMode) {
                return;
            }

            var polyline = this;
            polyline.isPolygon = false;
            polyline.asynchronous = false;

            changeablePrimitiveTool.registerEditableShape(polyline);

            polyline.setEditMode = setEditMode;

            var originalWidth = this.width;

            polyline.setHighlighted = function (highlighted) {
                // disable if already in edit mode
                if (this._editMode === true) {
                    return;
                }
                if (highlighted) {
                    changeablePrimitiveTool.setHighlighted(this);
                    this.setWidth(originalWidth * 2);
                } else {
                    this.setWidth(originalWidth);
                }
            };

            polyline.getExtent = function () {
                return Cesium.Extent.fromCartographicArray(ellipsoid.cartesianArrayToCartographicArray(this.positions));
            };

            enhanceWithListeners(polyline);
            polyline.setEditMode(true);

        };
        //取消编辑状态 -- 在外层控制 
        ChangeablePrimitiveTool.PolylinePrimitive.prototype.setEditableFalse = function () {
            var polyline = this;
            if (polyline.setEditMode) {
                polyline.setEditMode(false);
            }
        }

    };

    _.prototype.setListener = function (primitive, type, callback) {
        primitive[type] = callback;
    };
    //取消
    _.prototype.muteHandlers = function (muted) {
        this._handlersMuted = muted;
    };

    // 注册编辑事件
    // shape should implement setEditMode and setHighlighted
    _.prototype.registerEditableShape = function (surface) {
        var _self = this;
        // handlers for interactions
        // highlight polygon when mouse is entering
        setListener(surface, 'mouseMove', function (position) {
            surface.setHighlighted(true);
            if (!surface._editMode) {
                //_self._tooltip.showAt(position, "点击编辑结点");
                TooltipDiv.showAt(position, "点击编辑结点");
            }
        });
        // hide the highlighting when mouse is leaving the polygon
        setListener(surface, 'mouseOut', function (position) {
            surface.setHighlighted(false);
            //_self._tooltip.setVisible(false);
            TooltipDiv.setVisible(false);
        });
        setListener(surface, 'leftClick', function (position) {
            surface.setEditMode(true);
        });
    };


    //确保只有一个对象处于高亮
    _.prototype.disableAllHighlights = function () {
        this.setHighlighted(undefined);
    };

    _.prototype.setHighlighted = function (surface) {
        if (this._highlightedSurface && !this._highlightedSurface.isDestroyed() && this._highlightedSurface != surface) {
            this._highlightedSurface.setHighlighted(false);
        }
        this._highlightedSurface = surface;
    };

    _.prototype.disableAllEditMode = function () {
        this.setEdited(undefined);
    };

    //设置编辑状态
    _.prototype.setEdited = function (surface) {
        if (this._editedSurface && !this._editedSurface.isDestroyed()) {
            this._editedSurface.setEditMode(false);
        }
        this._editedSurface = surface;
    };

    //多段线
    _.PolylinePrimitive = (function () {
        function _(options, viewer) {
            if (isCreat) { } else {
                new ChangeablePrimitiveTool(viewer);
            }
            options = copyOptions(options, defaultPolylineOptions);

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
            return new Cesium.GroundPolylineGeometry({
                positions: this.positions,
                // height: this.height,
                width: this.width < 1 ? 1 : this.width,
                //vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                //ellipsoid: this.ellipsoid
            });
        };
        return _;
    })();
   

    //编辑状态节点 图标
    _.BillboardGroup = function (changeablePrimitiveTool, options) {

        this.changeablePrimitiveTool = changeablePrimitiveTool;
        this._scene = changeablePrimitiveTool._scene;

        this._options = copyOptions(options, defaultBillboard);

        // create one common billboard collection for all billboards
        var b = new Cesium.BillboardCollection({ scene: this._scene });
        this._scene.primitives.add(b);
        this._billboards = b;
        // keep an ordered list of billboards
        this._orderedBillboards = [];


        _.BillboardGroup.prototype.createBillboard = function (position, callbacks) {

            var billboard = this._billboards.add({
                show: true,
                position: position,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
                eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                scale: 2.0,
                image: this._options.iconUrl,
                color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
            });

            // if editable
            if (callbacks) {
                var _self = this;
                var screenSpaceCameraController = this._scene.screenSpaceCameraController;
                function enableRotation(enable) {
                    screenSpaceCameraController.enableRotate = enable;
                }
                function getIndex() {
                    // find index
                    for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                    return i;
                }
                if (callbacks.dragHandlers) {
                    var _self = this;
                    setListener(billboard, 'leftDown', function (position) {
                        // TODO - start the drag handlers here
                        // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                        function onDrag(position) {
                            billboard.position = position;
                            // find index
                            for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                            callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
                        }
                        function onDragEnd(position) {
                            handler.destroy();
                            enableRotation(true);
                            callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
                        }

                        var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);

                        handler.setInputAction(function (movement) {
                            //var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                            //var cartesian = _self.scene.pickPosition(movement.endPosition);
                            if (!!movement.endPosition) {
                                var ray = _self._scene.camera.getPickRay(movement.endPosition);
                                var cartesian = _self._scene.globe.pick(ray, _self._scene);
                                // var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                                if (cartesian) {
                                    onDrag(cartesian);
                                } else {
                                    onDragEnd(cartesian);
                                }
                            }
                        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                        handler.setInputAction(function (movement) {
                            //onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid
                            //onDragEnd(_self.scene.pickPosition(movement.position));
                            if (!!movement.position) {
                                var ray = _self._scene.camera.getPickRay(movement.position);
                                var cartesian = _self._scene.globe.pick(ray, _self._scene);
                                onDragEnd(cartesian);
                            }
                        }, Cesium.ScreenSpaceEventType.LEFT_UP);

                        enableRotation(false);

                        //callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, ellipsoid));
                        //callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self.scene.pickPosition(movement.position));
                        var ray = _self._scene.camera.getPickRay(position);
                        var cartesian = _self._scene.globe.pick(ray, _self._scene);
                        callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), cartesian);
                    });
                }
                //if (callbacks.onDoubleClick) {
                //    setListener(billboard, 'leftDoubleClick', function (position) {
                //        callbacks.onDoubleClick(getIndex());
                //    });
                //}
                if (callbacks.onRightClick) {
                    setListener(billboard, 'rightClick', function (position) {
                        callbacks.onRightClick(getIndex());
                    });
                }
                if (callbacks.onClick) {
                    setListener(billboard, 'leftClick', function (position) {
                        callbacks.onClick(getIndex());
                    });
                }
                //处理提示窗事件
                if (callbacks.tooltip) {
                    setListener(billboard, 'mouseMove', function (position) {
                        //_self.changeablePrimitiveTool._tooltip.showAt(position, callbacks.tooltip());
                        TooltipDiv.showAt(position, callbacks.tooltip());
                    });
                    setListener(billboard, 'mouseOut', function (position) {
                        //_self.changeablePrimitiveTool._tooltip.setVisible(false);
                        TooltipDiv.setVisible(false);
                    });
                }
            }

            return billboard;
        };
        _.BillboardGroup.prototype.insertBillboard = function (index, position, callbacks) {
            this._orderedBillboards.splice(index, 0, this.createBillboard(position, callbacks));
        };

        _.BillboardGroup.prototype.addBillboard = function (position, callbacks) {
            this._orderedBillboards.push(this.createBillboard(position, callbacks));
        };

        _.BillboardGroup.prototype.addBillboards = function (positions, callbacks) {
            var index = 0;
            for (; index < positions.length; index++) {
                this.addBillboard(positions[index], callbacks);
            }
        };

        _.BillboardGroup.prototype.updateBillboardsPositions = function (positions) {
            var index = 0;
            for (; index < positions.length; index++) {
                this.getBillboard(index).position = positions[index];
            }
        };

        _.BillboardGroup.prototype.countBillboards = function () {
            return this._orderedBillboards.length;
        };

        _.BillboardGroup.prototype.getBillboard = function (index) {
            return this._orderedBillboards[index];
        };

        _.BillboardGroup.prototype.removeBillboard = function (index) {
            this._billboards.remove(this.getBillboard(index));
            this._orderedBillboards.splice(index, 1);
        };

        _.BillboardGroup.prototype.remove = function () {
            this._billboards = this._billboards && this._billboards.removeAll() && this._billboards.destroy();
        };

        _.BillboardGroup.prototype.setOnTop = function () {
            this._scene.primitives.raiseToTop(this._billboards);
        };
    };


    return _;
})();
