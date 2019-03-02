;var CesiumHeatmap = (function(Cesium,h337){
    function CH(chviewer,geojsonUrl){
        this._viewer=chviewer;
        if(geojsonUrl){
            this.loadGeojson(geojsonUrl);
        }
    }

    CH.prototype.loadGeojson = function(url){
        getJSON(url,function(data){
            var lonmin=1000;
            var lonmax=-1000;
            var latmin=1000;
            var latmax=-1000;
            data.features.forEach(function(feature){
                var lon = feature.geometry.coordinates[0];
                var lat = feature.geometry.coordinates[1];
                lonmin = lon<lonmin?lon:lonmin;
                latmin = lat<latmin?lat:latmin;
                lonmax = lon>lonmax?lon:lonmax;
                latmax = lat>latmax?lat:latmax;
            });
            var xrange = lonmax-lonmin;
            var yrange = latmax-latmin;
            var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};

            var heatmapContainer = document.createElement('div');
            var width = 1000;
            var height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
            heatmapContainer.setAttribute('style','width:'+width+'px;height:'+height+'px');
            document.body.appendChild(heatmapContainer);

            this.heatmapInstance = h337.create({
                // only container is required, the rest will be defaults
                container: heatmapContainer,
                maxOpacity: .9,
                radius:30,
                // minimum opacity. any value > 0 will produce 
                // no transparent gradient transition
                minOpacity: .1,
                gradient: {
                    // enter n keys between 0 and 1 here
                    // for gradient color customization
                    '.3': 'blue',
                    '.5': 'green',
                    '.7': 'yellow',
                    '.95': 'red'
                },
            });
            var points = [];
            data.features.forEach(function(feature){
                var x = (feature.geometry.coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*width;
                var y = (-(feature.geometry.coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*height;
                var point = {
                    x: x,
                    y: y,
                    value: 0.02
                };
                points.push(point);
            });
            var data = { 
                max: 1, 
                data: points 
            };
            this.heatmapInstance.setData(data);
            this.heatmapcanvas = this.heatmapInstance._renderer.canvas;
            this.drawHeatmapRect(this.heatmapcanvas,extent);
            this._viewer.camera.flyTo({
                destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
            });
        }.bind(this));
    }

	CH.prototype.drawHeatmapRect = function(canvas,extent) {
		var image = convertCanvasToImage(canvas);
		this._worldRectangle = this._viewer.scene.primitives.add(new Cesium.Primitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : new Cesium.RectangleGeometry({
					rectangle : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax),
					vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
				})
			}),
			appearance : new Cesium.EllipsoidSurfaceAppearance({
				aboveGround : false
			}),
			show : true
		}));
		this._worldRectangle.appearance.material = new Cesium.Material({
			fabric : {
				type : 'Image',
				uniforms : {
					image : image.src
				}
			}
		});
    }

    CH.prototype.updateHeatmap=function(){
        var image = convertCanvasToImage(this.heatmapcanvas);
        this._worldRectangle.appearance.material.uniforms.image=image.src;
    }

    /**
     * Possible configuration properties:
    container (DOMNode) *required* 
    A DOM node where the heatmap canvas should be appended (heatmap will adapt to the node's size)
    backgroundColor (string) *optional*
    A background color string in form of hexcode, color name, or rgb(a)
    gradient (object) *optional*
    An object that represents the gradient (syntax: number string [0,1] : color string), check out the example
    radius (number) *optional*
    The radius each datapoint will have (if not specified on the datapoint itself)
    opacity (number) [0,1] *optional* default = .6
    A global opacity for the whole heatmap. This overrides maxOpacity and minOpacity if set!
    maxOpacity (number) [0,1] *optional*
    The maximal opacity the highest value in the heatmap will have. (will be overridden if opacity set)
    minOpacity(number) [0,1] *optional*
    The minimum opacity the lowest value in the heatmap will have (will be overridden if opacity set)
    onExtremaChange function callback
    Pass a callback to receive extrema change updates. Useful for DOM legends.
    blur (number) [0,1] *optional* default = 0.85
    The blur factor that will be applied to all datapoints. The higher the blur factor is, the smoother the gradients will be
    xField (string) *optional* default = "x"
    The property name of your x coordinate in a datapoint
    yField (string) *optional* default = "y"
    The property name of your y coordinate in a datapoint
    valueField (string) *optional* default = "value"
    The property name of your y coordinate in a datapoint
     */
    
    CH.prototype.config = function(options){
        this.heatmapInstance.configure(options);
        this.updateHeatmap();
    }

	function convertCanvasToImage(canvas) {
		var image = new Image();
		image.src = canvas.toDataURL("image/png");
		return image;
    }

    function getJSON(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('get', url, true);
		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				callback(xhr.response);
			} else {
				throw new Error(xhr.statusText);
			}
		};
		xhr.send();
	}
    
    return CH;
})(window.Cesium||{},window.h337||{});