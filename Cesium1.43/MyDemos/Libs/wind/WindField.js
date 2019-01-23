//define([],function () {

    var WindField = function (obj) {
        this.west = null;
        this.east = null;
        this.south = null;
        this.north = null;
        this.rows = null;
        this.cols = null;
        this.dx = null;
        this.dy = null;
        this.unit = null;
        this.date = null;

        this.grid = null;
        this._init(obj);
    };

    WindField.prototype = {
        constructor: WindField,
        _init: function (obj) {
            var header = obj.header,
                uComponent = obj['uComponent'],
                vComponent = obj['vComponent'];

            this.west = +header['lo1'];
            this.east = +header['lo2'];
            this.south = +header['la2'];
            this.north = +header['la1'];
            this.rows = +header['ny'];
            this.cols = +header['nx'];
            this.dx = +header['dx'];
            this.dy = +header['dy'];
            this.unit = header['parameterUnit'];
            this.date = header['refTime'];

            this.grid = [];
            var k = 0,
                rows = null,
                uv = null;
            for (var j = 0; j < this.rows; j++) {
                rows = [];
                for (var i = 0; i < this.cols; i++, k++) {
                    uv = this._calcUV(uComponent[k], vComponent[k]);
                    rows.push(uv);
                }
                this.grid.push(rows);
            }
        },
        _calcUV: function (u, v) {
            return [+u, +v, Math.sqrt(u * u + v * v)];
        },
        _bilinearInterpolation: function (x, y, g00, g10, g01, g11) {
            var rx = (1 - x);
            var ry = (1 - y);
            var a = rx * ry, b = x * ry, c = rx * y, d = x * y;
            var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
            var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
            return this._calcUV(u, v);
        },
        getIn: function (x, y) {
            var x0 = Math.floor(x),
                y0 = Math.floor(y),
                x1, y1;
            if (x0 === x && y0 === y) return this.grid[y][x];

            x1 = x0 + 1;
            y1 = y0 + 1;

            var g00 = this.getIn(x0, y0),
                g10 = this.getIn(x1, y0),
                g01 = this.getIn(x0, y1),
                g11 = this.getIn(x1, y1);
            return this._bilinearInterpolation(x - x0, y - y0, g00, g10, g01, g11);
        },
        isInBound: function (x, y) {
            if ((x >= 0 && x < this.cols - 2) && (y >= 0 && y < this.rows - 2)) return true;
            return false;
        }
    };

//    return WindField;
//})
