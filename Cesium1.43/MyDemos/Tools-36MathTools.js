var SysMathTool = (
    function () {
        var DeltaDegree = 0.00001;//插值间隔 单位度
        var DeltaRadian = 0.00001 * Math.PI / 180.0; //Cesium.Math.RADIANS_PER_DEGREE

        function CheckLonDegree(value) {
            if (value > 180 || value < -180) {
                return false;
            }
            return true;
        }
        function CheckLonRadian(value) {
            if (value > Math.PI || value < -Math.PI) {
                return false;
            }
            return true;
        }
        function CheckLatDegree(value) {
            if (value > 90 || value < -90) {
                return false;
            }
            return true;
        }
        function CheckLatRadian(value) {
            if (value > Math.PI / 2.0 || value < -Math.PI / 2.0) {
                return false;
            }
            return true;
        }

        function _() {
        }
        _.GetDeltaDegree = function () {
            return DeltaDegree;
        }
        _.GetDeltaRadian = function () {
            return DeltaRadian;
        }
        /*
        线段插值
        经纬度坐标插值
        start.lon start.lat  单位:度
        return [[lon,lat],...]
        */
        _.InterpolateLineLonlat = function (start, end) {
            if (start && end) { } else { return null; }
            if (start.lon && start.lat && end.lon && end.lat) { } else { return null; }
            if (CheckLonDegree(start.lon) && CheckLonDegree(end.lon) && CheckLatDegree(start.lat) && CheckLatDegree(end.lat)) { } else { return null; }
            var result = [];
            result.push([start.lon, start.lat]);
            var interval = Math.sqrt(Math.pow((end.lon - start.lon), 2) + Math.pow((end.lat - start.lat), 2));
            if (interval <= DeltaDegree) {
                //小于最小间隔
                result.push([end.lon, end.lat]);
                return result;
            } else {
                var num = interval / DeltaDegree;
                var stepLon = (end.lon - start.lon) / num;
                var stepLat = (end.lat - start.lat) / num;
                for (var i = 0; i < num; i++) {
                    var lon = start.lon + (i + 1) * stepLon;
                    var lat = start.lat + (i + 1) * stepLat;
                    result.push([lon, lat]);
                }
            }
            return result;
        }
        /*
        线段插值
        经纬度坐标插值
        Cartographic start.longitude start.latitude 单位:弧度
        return [Cartographic,...]
        */
        _.InterpolateLineCartographic = function (start, end, _Delta) {
            if (start && end) { } else { return null; }
            if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
            var result = [];
            //开始点
            result.push(new Cesium.Cartographic(start.longitude, start.latitude));
            var interval = Math.sqrt(Math.pow((end.longitude - start.longitude), 2) + Math.pow((end.latitude - start.latitude), 2));
            var delta = _Delta && (typeof _Delta === 'number') ? _Delta : DeltaRadian;
            if (interval <= delta) {
                //小于最小间隔
                result.push(new Cesium.Cartographic(end.longitude, end.latitude));
                return result;
            } else {
                var num = interval / delta;
                var stepLon = (end.longitude - start.longitude) / num;
                var stepLat = (end.latitude - start.latitude) / num;
                for (var i = 0; i < num; i++) {
                    var lon = start.longitude + (i + 1) * stepLon;
                    var lat = start.latitude + (i + 1) * stepLat;
                    result.push(new Cesium.Cartographic(lon, lat));//与最后一个点有偏差
                }
                result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
            }
            return result;
        }

        /*
        线段插值
        经纬度高程插值
        Cartographic start.longitude start.latitude 单位:弧度 start.height 高程单位m
        return [Cartographic,...]
        */
        _.InterpolateLineHeightCartographic = function (start, end) {
            if (start && end) { } else { return null; }
            if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
            var result = [];
            result.push(new Cesium.Cartographic(start.longitude, start.latitude, start.height));
            var interval = Math.sqrt(Math.pow((end.longitude - start.longitude), 2) + Math.pow((end.latitude - start.latitude), 2));
            if (interval <= DeltaRadian) {
                //小于最小间隔
                result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
                return result;
            } else {
                var num = interval / DeltaRadian;
                var stepLon = (end.longitude - start.longitude) / num;
                var stepLat = (end.latitude - start.latitude) / num;
                var stepHeight = (end.height - start.height) / num;
                for (var i = 0; i < num; i++) {
                    var lon = start.longitude + (i + 1) * stepLon;
                    var lat = start.latitude + (i + 1) * stepLat;
                    var hieght = start.height + (i + 1) * stepHeight;
                    result.push(new Cesium.Cartographic(lon, lat, hieght));
                }
                result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
            }
            return result;
        }

        /*
        线段插值
        经纬度高程插值
        Cartographic start.longitude start.latitude 单位:弧度 start.height 高程单位m
        num:分总段数  传入数组长度-1
        index:获取到第index点的所有插值 0点是开始点
        return [Cartographic,...]
        */
        _.Interpolate2IndexLineHeightCartographic = function (start, end, num, curIndex) {
            if (start && end) { } else { return null; }
            if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
            var result = [];
            result.push(new Cesium.Cartographic(start.longitude, start.latitude, start.height));
            var stepLon = (end.longitude - start.longitude) / num;
            var stepLat = (end.latitude - start.latitude) / num;
            var stepHeight = (end.height - start.height) / num;
            for (var i = 0; i < curIndex; i++) {
                var lon = start.longitude + (i + 1) * stepLon;
                var lat = start.latitude + (i + 1) * stepLat;
                var hieght = start.height + (i + 1) * stepHeight;
                result.push(new Cesium.Cartographic(lon, lat, hieght));
            }
            //result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
            return result;
        }

        /*
        线段插值 指定第index值
        经纬度高程插值
        Cartographic start.longitude start.latitude 单位:弧度 start.height 高程单位m
        num:分总段数  传入数组长度-1
        index:获取第index个插值点  0点是开始点
        return Cartographic
        */
        _.InterpolateIndexLineHeightCartographic = function (start, end, num, index) {
            if (start && end) { } else { return null; }
            if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
            //var delta = _Delta && (typeof _Delta === 'number') ? _Delta : DeltaRadian;    
            var stepLon = (end.longitude - start.longitude) / num;
            var stepLat = (end.latitude - start.latitude) / num;
            var stepHeight = (end.height - start.height) / num;
            var lon = start.longitude + index * stepLon;
            var lat = start.latitude + index * stepLat;
            var hieght = start.height + index * stepHeight;
            var result = new Cesium.Cartographic(lon, lat, hieght);
            return result;
        }

        return _;
    })();