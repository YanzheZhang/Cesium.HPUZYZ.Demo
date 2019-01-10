var EllipseGeometryLibraryEx = (function () {
    var EllipseGeometryLibrary = {};

    var rotAxis = new Cesium.Cartesian3();
    var tempVec = new Cesium.Cartesian3();
    var unitQuat = new Cesium.Quaternion();
    var rotMtx = new Cesium.Matrix3();

    function pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, result) {
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

    var scratchCartesian1 = new Cesium.Cartesian3();
    var scratchCartesian2 = new Cesium.Cartesian3();
    var scratchCartesian3 = new Cesium.Cartesian3();
    var scratchNormal = new Cesium.Cartesian3();
    /**
     * Returns the positions raised to the given heights
     * @private
     */
    EllipseGeometryLibrary.raisePositionsToHeight = function (positions, options, extrude) {
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

    var unitPosScratch = new Cesium.Cartesian3();
    var eastVecScratch = new Cesium.Cartesian3();
    var northVecScratch = new Cesium.Cartesian3();
    /**
     * options.semiMinorAxis：短半轴
     * options.semiMajorAxis：长半轴
     * options.rotation：旋转角度 弧度
     * options.center：中心点 笛卡尔坐标
     * options.granularity：粒度 弧度
       addFillPositions：是否插值
       addEdgePositions：是否添加端点
     * Returns an array of positions that make up the ellipse.
     * @private
     */
    EllipseGeometryLibrary.computeEllipsePositions = function (options, addEdgePositions) {
        var semiMinorAxis = options.semiMinorAxis;
        var semiMajorAxis = options.semiMajorAxis;
        var rotation = options.rotation;//法线
        var center = options.center;
        var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
        if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }
        if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }
        var aSqr = semiMinorAxis * semiMinorAxis;
        var bSqr = semiMajorAxis * semiMajorAxis;
        var ab = semiMajorAxis * semiMinorAxis;

        var mag = Cesium.Cartesian3.magnitude(center);//模

        var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
        var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
        eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
        var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
        var numPts = 1 + Math.ceil(Cesium.Math.PI_OVER_TWO / granularity);

        var deltaTheta = Cesium.Math.PI_OVER_TWO / (numPts - 1);
        var theta = Cesium.Math.PI_OVER_TWO - numPts * deltaTheta;
        if (theta < 0.0) {
            numPts -= Math.ceil(Math.abs(theta) / deltaTheta);
        }
        var positions = new Array((numPts + 1) * 3);
        var positionsdown = new Array((numPts + 1) * 3);

        var positionIndex = 0;
        var positionsdownIndex = 0;
        var position = scratchCartesian1;
        var reflectedPosition = scratchCartesian2;

        var outerPositionsLength = (numPts * 4) * 3;
        var outerRightIndex = outerPositionsLength - 1;
        var outerLeftIndex = 0;
        var outerPositions = (addEdgePositions) ? new Array(outerPositionsLength) : undefined;

        var i;
        var j;
        var numInterior;
        var t;
        var interiorPosition;

        theta = Cesium.Math.PI_OVER_TWO;
        position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
        positions[positionIndex++] = position.x;
        positions[positionIndex++] = position.y;
        positions[positionIndex++] = position.z;
        if (addEdgePositions) {
            outerPositions[outerRightIndex--] = position.z;
            outerPositions[outerRightIndex--] = position.y;
            outerPositions[outerRightIndex--] = position.x;
        }

        theta = Cesium.Math.PI_OVER_TWO - deltaTheta;
        for (i = 1; i < numPts + 1; ++i) {
            position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
            reflectedPosition = pointOnEllipsoid(Math.PI - theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, reflectedPosition);
            positionsdown[positionsdownIndex++] = position.x;
            positionsdown[positionsdownIndex++] = position.y;
            positionsdown[positionsdownIndex++] = position.z;
            positions[positionIndex++] = reflectedPosition.x;
            positions[positionIndex++] = reflectedPosition.y;
            positions[positionIndex++] = reflectedPosition.z;
            if (addEdgePositions) {
                outerPositions[outerRightIndex--] = position.z;
                outerPositions[outerRightIndex--] = position.y;
                outerPositions[outerRightIndex--] = position.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.y;
                outerPositions[outerLeftIndex++] = reflectedPosition.z;
            }

            theta = Cesium.Math.PI_OVER_TWO - (i + 1) * deltaTheta;
        }
        for (i = numPts; i > 1; --i) {
            theta = Cesium.Math.PI_OVER_TWO - (i - 1) * deltaTheta;

            position = pointOnEllipsoid(-theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
            reflectedPosition = pointOnEllipsoid(theta + Math.PI, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, reflectedPosition);
            positionsdown[positionsdownIndex++] = position.x;
            positionsdown[positionsdownIndex++] = position.y;
            positionsdown[positionsdownIndex++] = position.z;
            positions[positionIndex++] = reflectedPosition.x;
            positions[positionIndex++] = reflectedPosition.y;
            positions[positionIndex++] = reflectedPosition.z;
            if (addEdgePositions) {
                outerPositions[outerRightIndex--] = position.z;
                outerPositions[outerRightIndex--] = position.y;
                outerPositions[outerRightIndex--] = position.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.y;
                outerPositions[outerLeftIndex++] = reflectedPosition.z;
            }
        }

        theta = Cesium.Math.PI_OVER_TWO;
        position = pointOnEllipsoid(-theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);

        var r = {};
        positionsdown[positionsdownIndex++] = position.x;
        positionsdown[positionsdownIndex++] = position.y;
        positionsdown[positionsdownIndex++] = position.z;

        r.positions = positions;
        r.positionsdown = positionsdown;
        r.numPts = numPts;
        if (addEdgePositions) {
            outerPositions[outerRightIndex--] = position.z;
            outerPositions[outerRightIndex--] = position.y;
            outerPositions[outerRightIndex--] = position.x;
            r.outerPositions = outerPositions;
        }
        return r;
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
        var semiMinorAxis = options.semiMinorAxis;
        var semiMajorAxis = options.semiMajorAxis;
        var rotation = options.rotation;//法线
        var center = options.center;
        var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
        if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }
        if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }
        var aSqr = semiMinorAxis * semiMinorAxis;
        var bSqr = semiMajorAxis * semiMajorAxis;
        var ab = semiMajorAxis * semiMinorAxis;
        var mag = Cesium.Cartesian3.magnitude(center);//
        var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
        var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
        eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
        var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
        var numPts = Math.ceil(Cesium.Math.PI * 2 / granularity);
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