var ImageryProviderWebExtendTool = (
    function () {
        function _() { }

        _.createGoogleMapsByUrl = function (Cesium, options) {
            options = Cesium.defaultValue(options, {});

            var templateUrl = Cesium.defaultValue(options.url, 'http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}');

            var trailingSlashRegex = /\/$/;
            var defaultCredit = new Cesium.Credit('Google Maps');

            var tilingScheme = new Cesium.WebMercatorTilingScheme({ ellipsoid: options.ellipsoid });

            var tileWidth = 256;
            var tileHeight = 256;

            var minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
            var maximumLevel = Cesium.defaultValue(options.minimumLevel, 17);

            var rectangle = Cesium.defaultValue(options.rectangle, tilingScheme.rectangle);

            // Check the number of tiles at the minimum level.  If it's more than four,
            // throw an exception, because starting at the higher minimum
            // level will cause too many tiles to be downloaded and rendered.
            var swTile = tilingScheme.positionToTileXY(Cesium.Rectangle.southwest(rectangle), minimumLevel);
            var neTile = tilingScheme.positionToTileXY(Cesium.Rectangle.northeast(rectangle), minimumLevel);
            var tileCount = (Math.abs(neTile.x - swTile.x) + 1) * (Math.abs(neTile.y - swTile.y) + 1);
            //>>includeStart('debug', pragmas.debug);
            if (tileCount > 4) {
                throw new Cesium.DeveloperError('The rectangle and minimumLevel indicate that there are ' + tileCount + ' tiles at the minimum level. Imagery providers with more than four tiles at the minimum level are not supported.');
            }
            //>>includeEnd('debug');

            var credit = Cesium.defaultValue(options.credit, defaultCredit);
            if (typeof credit === 'string') {
                credit = new Cesium.Credit(credit);
            }

            return new Cesium.UrlTemplateImageryProvider({
                url: templateUrl,
                proxy: options.proxy,
                credit: credit,
                tilingScheme: tilingScheme,
                tileWidth: tileWidth,
                tileHeight: tileHeight,
                minimumLevel: minimumLevel,
                maximumLevel: maximumLevel,
                rectangle: rectangle
            });
        }
        return _;
    }
)();