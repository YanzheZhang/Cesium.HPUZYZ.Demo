var EllipseGeometryLibraryEx = (function () {
    var EllipseGeometryLibrary = {};

    function pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, result) {
        var rotAxis = new Cesium.Cartesian3();
        var tempVec = new Cesium.Cartesian3();
        var unitQuat = new Cesium.Quaternion();
        var rotMtx = new Cesium.Matrix3();

        var azimuth = theta + rotation;

        Cesium.Cartesian3.multiplyByScalar(eastVec, Math.cos(azimuth), rotAxis);
        Cesium.Cartesian3.multiplyByScalar(northVec, Math.sin(azimuth), tempVec);
        Cesium.Cartesian3.add(rotAxis, tempVec, rotAxis);

        var cosThetaSquared = Math.cos(theta);
        cosThetaSquared = cosThetaSquared * cosThetaSquared;

        var sinThetaSquared = Math.sin(theta);
        sinThetaSquared = sinThetaSquared * sinThetaSquared;

        var radius = ab / Math.sqrt(bSqr * cosThetaSquared + aSqr * sinThetaSquared);
        var angle = radius / mag;

        // Create the quaternion to rotate the position vector to the boundary of the ellipse.
        Cesium.Quaternion.fromAxisAngle(rotAxis, angle, unitQuat);
        Cesium.Matrix3.fromQuaternion(unitQuat, rotMtx);

        Cesium.Matrix3.multiplyByVector(rotMtx, unitPos, result);
        Cesium.Cartesian3.normalize(result, result);
        Cesium.Cartesian3.multiplyByScalar(result, mag, result);
        return result;
    }

    /**
     * Returns the positions raised to the given heights
     * @private
     */
    EllipseGeometryLibrary.raisePositionsToHeight = function (positions, options, extrude) {
        var scratchCartesian1 = new Cesium.Cartesian3();
        var scratchCartesian2 = new Cesium.Cartesian3();
        var scratchCartesian3 = new Cesium.Cartesian3();
        var scratchNormal = new Cesium.Cartesian3();

        var ellipsoid = options.ellipsoid;
        var height = options.height;
        var extrudedHeight = options.extrudedHeight;
        var size = (extrude) ? positions.length / 3 * 2 : positions.length / 3;

        var finalPositions = new Float64Array(size * 3);

        var length = positions.length;
        var bottomOffset = (extrude) ? length : 0;
        for (var i = 0; i < length; i += 3) {
            var i1 = i + 1;
            var i2 = i + 2;

            var position = Cesium.Cartesian3.fromArray(positions, i, scratchCartesian1);
            ellipsoid.scaleToGeodeticSurface(position, position);

            var extrudedPosition = Cesium.Cartesian3.clone(position, scratchCartesian2);
            var normal = ellipsoid.geodeticSurfaceNormal(position, scratchNormal);
            var scaledNormal = Cesium.Cartesian3.multiplyByScalar(normal, height, scratchCartesian3);
            Cesium.Cartesian3.add(position, scaledNormal, position);

            if (extrude) {
                Cesium.Cartesian3.multiplyByScalar(normal, extrudedHeight, scaledNormal);
                Cesium.Cartesian3.add(extrudedPosition, scaledNormal, extrudedPosition);

                finalPositions[i + bottomOffset] = extrudedPosition.x;
                finalPositions[i1 + bottomOffset] = extrudedPosition.y;
                finalPositions[i2 + bottomOffset] = extrudedPosition.z;
            }

            finalPositions[i] = position.x;
            finalPositions[i1] = position.y;
            finalPositions[i2] = position.z;
        }

        return finalPositions;
    };

    /**
    * options.semiMinorAxis：短半轴
    * options.semiMajorAxis：长半轴
    * options.rotation：旋转角度 弧度
    * options.center：中心点 笛卡尔坐标
    * options.granularity：粒度 弧度
    * Returns an array of positions that make up the ellipse.
    * @private
    */
    EllipseGeometryLibrary.computeEllipseEdgePositions = function (options) {
        var unitPosScratch = new Cesium.Cartesian3();
        var eastVecScratch = new Cesium.Cartesian3();
        var northVecScratch = new Cesium.Cartesian3();
        var scratchCartesian1 = new Cesium.Cartesian3();

        var semiMinorAxis = options.semiMinorAxis;
        var semiMajorAxis = options.semiMajorAxis;
        var rotation = options.rotation;//法线
        var center = options.center;
        var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
        if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }//最小分24
        if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }//最大分360
        var aSqr = semiMinorAxis * semiMinorAxis;
        var bSqr = semiMajorAxis * semiMajorAxis;
        var ab = semiMajorAxis * semiMinorAxis;
        var mag = Cesium.Cartesian3.magnitude(center);//
        var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
        var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
        eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
        var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
        var numPts = Math.ceil(Cesium.Math.PI*2 / granularity);
        var deltaTheta = granularity;
        var theta = 0;
        
        var position = scratchCartesian1;
        var i;
        var outerIndex = 0;
        var outerPositions = [];
        for (i = 0; i < numPts; i++) {
            theta = i * deltaTheta;
            position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
            
            outerPositions[outerIndex++] = position.x;
            outerPositions[outerIndex++] = position.y;
            outerPositions[outerIndex++] = position.z;
        }

        var r = {};
        r.numPts = numPts;
        r.outerPositions = outerPositions;
        return r;
    };

    /**
    * options.semiMinorAxis：短半轴
    * options.semiMajorAxis：长半轴
    * options.rotation：旋转角度 弧度
    * options.center：中心点 笛卡尔坐标
    * options.granularity：粒度 弧度
    * options.angle：角度 弧度
    * Returns an array of positions that make up the ellipse.
    * @private
    */
    EllipseGeometryLibrary.computeSectorEdgePositions = function (options) {
        var unitPosScratch = new Cesium.Cartesian3();
        var eastVecScratch = new Cesium.Cartesian3();
        var northVecScratch = new Cesium.Cartesian3();
        var scratchCartesian1 = new Cesium.Cartesian3();

        var semiMinorAxis = options.semiMinorAxis;
        var semiMajorAxis = options.semiMajorAxis;
        var rotation = options.rotation;
        var angle = options.angle ? options.angle : Math.PI * 2.0;
        var center = options.center;
        var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
        if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }//最小分24
        if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }//最大分360
        var aSqr = semiMinorAxis * semiMinorAxis;
        var bSqr = semiMajorAxis * semiMajorAxis;
        var ab = semiMajorAxis * semiMinorAxis;
        var mag = Cesium.Cartesian3.magnitude(center);//
        var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
        var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
        eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
        var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
        var numPts = Math.ceil(angle / granularity);//Math.ceil(Cesium.Math.PI * 2 / granularity);
        var deltaTheta = granularity;
        var theta = 0;

        var position = scratchCartesian1;
        var i;
        var outerIndex = 0;
        var outerPositions = [];
        for (i = 0; i < numPts; i++) {
            theta = i * deltaTheta;
            position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);

            outerPositions[outerIndex++] = position.x;
            outerPositions[outerIndex++] = position.y;
            outerPositions[outerIndex++] = position.z;
        }

        var r = {};
        r.numPts = numPts;
        r.outerPositions = outerPositions;
        return r;
    };
    return EllipseGeometryLibrary;
})();