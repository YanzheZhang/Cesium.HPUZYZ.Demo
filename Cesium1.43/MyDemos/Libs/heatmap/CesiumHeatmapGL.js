;var CesiumHeatmapGL = (function(Cesium,createWebGLHeatmap){
    function CHGL(chglviewer,geojsonUrl){
        this._viewer=chglviewer;
        if(geojsonUrl){
            this.loadGeojson(geojsonUrl);
        }
    }

    CHGL.prototype.loadGeojson = function(url){
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
            var heatmapcanvas = document.createElement('canvas');
            document.body.appendChild(heatmapcanvas);
            heatmapcanvas.width = 1000;
            heatmapcanvas.height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
            try{
                var heatmap = this._heatmap = createWebGLHeatmap({canvas: heatmapcanvas,intensityToAlpha:true});
            }
            catch(error){
                console.error(error);
            }
            data.features.forEach(function(feature){
                var x = (feature.geometry.coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*heatmapcanvas.clientWidth;
                var y = (-(feature.geometry.coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*heatmapcanvas.clientHeight;
                heatmap.addPoint(x, y, 20, 0.05);
            });
            heatmap.adjustSize(); 
            heatmap.update();
            heatmap.display();
            this.drawHeatmapRect(heatmapcanvas,extent);
            this._viewer.camera.flyTo({
                destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
            });
        }.bind(this));
    }

	CHGL.prototype.drawHeatmapRect = function(canvas,extent) {
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

    CHGL.prototype.updateHeatmap=function(){
        this._heatmap.adjustSize(); 
        this._heatmap.update();
        this._heatmap.display();

        var image = convertCanvasToImage(this._heatmap.canvas);
        this._worldRectangle.appearance.material.uniforms.image=image.src;
        //  = new Cesium.Material({
		// 	fabric : {
		// 		type : 'Image',
		// 		uniforms : {
		// 			image : image.src
		// 		}
		// 	}
		// });
    }
    
    CHGL.prototype.multiply = function(value){
        this._heatmap.multiply(value);
        this.updateHeatmap();
    }

    CHGL.prototype.clamp = function(min,max){
        this._heatmap.clamp(min, max);
        this.updateHeatmap();
    }

    CHGL.prototype.blur = function(){
        this._heatmap.blur();
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
    
    return CHGL;
})(window.Cesium||{},window.createWebGLHeatmap||{});