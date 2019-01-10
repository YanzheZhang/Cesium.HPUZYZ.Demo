//获取高程
var TerrainToolCopy = (
     function () {
         var terrainProvider = new Cesium.CesiumTerrainProvider({
             url: './sampledata/terrain/ctb-merger/' //
         });
         var terrainLevel = 14;//数据等级14

         function _() {

         }

         //传入lonlat数组 角度制的lon lat
         _.LonlatPointsTerrainData = function (lonlats, callback) {
             var pointArrInput = [];
             for (var i = 0; i < lonlats.length; i++) {
                 pointArrInput.push(Cesium.Cartographic.fromDegrees(lonlats[i].lon, lonlats[i].lat));
             }
             var promise = Cesium.sampleTerrain(terrainProvider, terrainLevel, pointArrInput);//pointArrInput
             Cesium.when(promise, function (updatedPositions) {
                 callback(updatedPositions);
             });
         };

         //传入Cartographic类型数组 弧度制经纬度
         _.CartographicPointsTerrainData = function (Cartographics, callback) {
             if (Cartographics.length && Cartographics.length > 0) { } else { return; }
             var promise = Cesium.sampleTerrain(terrainProvider, terrainLevel, Cartographics);//pointArrInput
             Cesium.when(promise, function (updatedPositions) {
                 callback(updatedPositions);
             });
         };
         return _;
     }
)();