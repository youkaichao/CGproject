let TriPlay = function () {
    let that = this;
    let svg = null;
    let triG = null;
    let inputview = null;
    let fiskview = null;
    let lastTriangleBuffer = [];

    that.__init = function() {
        svg = d3.select("#mainsvg");
        triG = svg.append("g").attr("id", "tri-g");

        $("#tri-next-comp-btn").click(() => {that.step(0)});
        $("#tri-last-comp-btn").click(() => {that.step(1)});
        $("#tri-start-comp-btn").click(() => {that.step(2)});
        $("#tri-end-comp-btn").click(() => {that.step(3)});

    };

    that.getLastTriangleBuffer = function() {
        return lastTriangleBuffer
    };

    that.connectInputview = function(tinput) {
        inputview = tinput;
    };

    that.connectFiskView = function(fisk) {
        fiskview = fisk;
    };

    that.update_view = function() {
        // update data
        let triangleData = TriStatus[SelectTriStatus];
        // let polygonEdges = {};
        // let showingEdges = {};
        // for(let i=0; i<SelectPoints.length; i++) {
        //     let u=SelectPoints[i];
        //     let v=SelectPoints[(i+1===SelectPoints.length)?0:(i+1)];
        //     polygonEdges[u.x+','+u.y+','+v.x+','+v.y] = true;
        // }
        //
        // for(let triangle of triangleData.outputs) {
        //     for(let i=0; i<3; i++) {
        //         let u = triangle.points[i];
        //         let v = triangle.points[(i===2)?0:2];
        //         let id1 = u.x+','+u.y+','+v.x+','+v.y;
        //         let id2 = v.x+','+v.y+','+u.x+','+u.y;
        //         if(polygonEdges[id1]||polygonEdges[id2]||showingEdges[id1]||showingEdges[id2]) continue;
        //         showingEdges[id1] = true;
        //     }
        // }
        for(let i=0; i<triangleData.outputs.length; i++) {
            triangleData.outputs[i].id = i;
        }
        if(TriangulationUseBuffer)
            lastTriangleBuffer = lastTriangleBuffer.concat(triangleData.outputs);
        else lastTriangleBuffer = triangleData.outputs;

        // triangle pieces
        let tripieces = triG.selectAll("."+TriangleAttrs["class"]).data(lastTriangleBuffer);
        tripieces.enter()
            .append("path")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TriangleAttrs)) {
                    ele.attr(key, TriangleAttrs[key]);
                }
            });
        tripieces
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TriangleAttrs)) {
                    ele.attr(key, TriangleAttrs[key]);
                }
            });
        tripieces.exit().remove();

        // triangle current point
        let trianglePoint = triG.selectAll("."+TriangleCurPoint["class"]).data([triangleData.c]);
        trianglePoint.enter()
            .append("circle")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TriangleCurPoint)) {
                    ele.attr(key, TriangleCurPoint[key]);
                }
            });
        trianglePoint
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TriangleCurPoint)) {
                    ele.attr(key, TriangleCurPoint[key]);
                }
            });
        trianglePoint.exit().remove();
    };

    that.step = function(flag = 0) {
        //0: next, 1: last, 2: start, 3: end
        if(fiskview.isPlaying()) return;
        if(TriStatus.length === 0) {
            alert("No simple polygon selected to show triangulation");
            return
        }
        if (flag===0)
            SelectTriStatus = (SelectTriStatus+1)%TriStatus.length;
        else if(flag===1)
            SelectTriStatus = (SelectTriStatus+TriStatus.length-1)%TriStatus.length;
        else if(flag===2)
            SelectTriStatus = 0;
        else if(flag===3)
            SelectTriStatus = TriStatus.length-1;
        that.update_view()
    };

    that.clear = function() {
        fiskview.clear();
        TriStatus = [];
        SelectTriStatus = -1;
        lastTriangleBuffer = [];
        $("#tri-label").text("Selected Trapezoid: None");
        triG.selectAll("."+TriangleAttrs["class"]).data([]).exit().remove();
        triG.selectAll("."+TriangleCurPoint["class"]).data([]).exit().remove();
    };

    that.init = function () {
        that.__init();
    }.call();
};