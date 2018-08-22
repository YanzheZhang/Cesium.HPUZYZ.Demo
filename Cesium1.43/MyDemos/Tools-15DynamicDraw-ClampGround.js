var DrawDynamicClampGround = (function () {
    var mouseHandlerDraw;
    function GetNorthCartesain(cartesain0, cartesain1) {
        var cartographic0 = Cesium.Cartographic.fromCartesian(cartesain0);
        var cartographic1 = Cesium.Cartographic.fromCartesian(cartesain1);
        var height = cartographic0.height > cartographic1.height ? cartographic0.height : cartographic1.height;
        var length = Math.sqrt((cartographic0.longitude - cartographic1.longitude) * (cartographic0.longitude - cartographic1.longitude)+
            (cartographic0.latitude - cartographic1.latitude) * (cartographic0.latitude - cartographic1.latitude));
        var cartographicN = new Cesium.Cartographic(cartographic0.longitude, cartographic0.latitude + length, height);
        var cartesainN = Cesium.Cartesian3.fromRadians(cartographicN.longitude, cartographicN.latitude, cartographicN.height);
        return cartesainN;
    }

    function _() { }
    //绘制点
    _.startDrawPoint = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    if (cartographic) {
                        if (typeof callback == 'function') {
                            callback(cartographic);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                TooltipDiv.showAt(movement.endPosition, '点击添加点');
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    //绘制线段
    _.startDrawingLine = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        var drawingPolyline = null;
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    } else if (positions.length == 1) {
                        positions.push(cartesian.clone());
                        if (typeof callback == 'function') {
                            callback(positions);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                        //移除 
                        if (drawingPolyline != undefined)
                            viewer.entities.remove(drawingPolyline);

                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                if (positions.length == 0) {
                    TooltipDiv.showAt(movement.endPosition, '点击添加起点');
                } else if (positions.length == 1) {
                    //更新entity
                    var positionArr = [];
                    positionArr.push(positions[0]);
                    positionArr.push(cartesian);
                    if (drawingPolyline != undefined)
                        viewer.entities.remove(drawingPolyline);
                    var lineOpts = {
                        polyline: {
                            positions: positionArr,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.5),
                        }
                    };
                    drawingPolyline = viewer.entities.add(lineOpts);
                    TooltipDiv.showAt(movement.endPosition, "点击添加终点");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    };
    //绘制多段线
    _.startDrawingPolyline = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        var drawingPolyline = null;
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    positions.push(cartesian.clone());
                //    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);//当前点
                //    if (cartographic) { 
                //        if (cartesian) {
                //            var isIntersect = false;
                //            if (positions.length >= 3) {
                //                var cartographicArr = [];
                //                for (var i = 0; i < positions.length; i++) {
                //                    cartographicArr.push(Cesium.Cartographic.fromCartesian(positions[i]));
                //                }
                //                var line1 = turf.lineString([[cartographic.longitude, cartographic.latitude], [cartographicArr[cartographicArr.length - 1].longitude, cartographicArr[cartographicArr.length - 1].latitude]]);
                //                for (var i = 2; i < positions.length; i++) {
                //                    var line2 = turf.lineString([
                //                        [cartographicArr[i - 2].longitude, cartographicArr[i - 2].latitude],
                //                        [cartographicArr[i - 1].longitude, cartographicArr[i - 1].latitude]]);
                //                    var intersects = turf.lineIntersect(line1, line2);
                //                    if (intersects && intersects.features && intersects.features.length > 0) {
                //                        isIntersect = true;
                                        
                //                        alert('图形自相交！');
                //                        break;
                //                    }
                //                }
                //            }
                //            if (isIntersect) { } else {
                //                positions.push(cartesian.clone());
                //            }
                //        }
                //    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                if (positions.length == 0) {
                    TooltipDiv.showAt(movement.endPosition, '点击添加起点');
                } else {
                    var positionArr = [];
                    for (var i = 0; i < positions.length; i++) {
                        positionArr.push(positions[i]);
                    }
                    positionArr.push(cartesian);

                    if (drawingPolyline != undefined)
                        viewer.entities.remove(drawingPolyline);
                    var lineOpts = {
                        polyline: {
                            positions: positionArr,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.5),
                        }
                    };
                    drawingPolyline = viewer.entities.add(lineOpts);
                    TooltipDiv.showAt(movement.endPosition, "双击结束");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    if (positions.length < 2) {
                        return;
                    } else {

                        if (typeof callback == 'function') {
                            callback(positions);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                        //移除entity
                        if (drawingPolyline != undefined)
                            viewer.entities.remove(drawingPolyline);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };
    //绘制方位线
    _.startDrawingVLine = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        var drawingPolylineN = null;
        var drawingPolylineT = null;
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    } else if (positions.length == 1) {
                        positions.push(cartesian.clone());
                        if (typeof callback == 'function') {
                            callback(positions);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                        //移除 
                        if (drawingPolylineN != undefined)
                            viewer.entities.remove(drawingPolylineN);
                        if (drawingPolylineT != undefined)
                            viewer.entities.remove(drawingPolylineT);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                if (positions.length == 0) {
                    TooltipDiv.showAt(movement.endPosition, '点击添加起点');
                } else if (positions.length == 1) {
                    //更新entity
                    var positionArr = [];
                    positionArr.push(positions[0]);
                    positionArr.push(cartesian);
                    //实时 
                    if (drawingPolylineT != undefined)
                        viewer.entities.remove(drawingPolylineT);
                    var lineOptsT = {
                        polyline: {
                            positions: positionArr,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.5),
                        }
                    };
                    drawingPolylineT = viewer.entities.add(lineOptsT);
                    //正北
                    var positionN = [];
                    positionN.push(positions[0]);
                    positionN.push(GetNorthCartesain(positions[0], cartesian));
                    if (drawingPolylineN != undefined)
                        viewer.entities.remove(drawingPolylineN);
                    var lineOptsN = {
                        polyline: {
                            positions: positionN,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.RED.withAlpha(0.5),
                        }
                    };
                    drawingPolylineN = viewer.entities.add(lineOptsN);
                    TooltipDiv.showAt(movement.endPosition, "点击结束");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
    return _;
})();