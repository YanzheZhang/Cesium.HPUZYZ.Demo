var TooltipCesium = (function () {
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

    /*
    position屏幕坐标
    显示在椭球面
    */
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

    /*
    cartesian世界坐标
    显示在真实位置
    */
    _.showAtCartesian = function (cartesian, message) {
        if (!isInit) { return; }
        if (cartesian && message) {
            labelEntity.show = true;

            labelEntity.position = cartesian;
            labelEntity.show = true;
            labelEntity.label.text = message;
        }
    };
    return _;
})();