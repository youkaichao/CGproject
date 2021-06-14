let TriPlay = function () {
    let that = this;
    let svg = null;
    let triG = null;
    let infog = null;
    let inputview = null;
    let fiskview = null;
    let lastTriangleBuffer = [];
    let nodeg = null;
    let curg = null;
    let stackg = null;

    that.__init = function() {
        svg = d3.select("#mainsvg");
        infog = svg.select("#infog");
        triG = svg.select("#tri-g");
        nodeg = svg.select("#middle-node-g");
        stackg = nodeg.append("g").attr("id", "stack-g");
        curg = nodeg.append("g").attr("id", "current-g");



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

        let stacklen = triangleData.stack.length;
        let stackPoint = stackg.selectAll("."+StackCurPoint["class"]).data(triangleData.stack.slice(Math.max(0, stacklen-2), stacklen));
        stackPoint.enter()
            .append("circle")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(StackCurPoint)) {
                    ele.attr(key, StackCurPoint[key]);
                }
            });
        stackPoint
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(StackCurPoint)) {
                    ele.attr(key, StackCurPoint[key]);
                }
            });
        stackPoint.exit().remove();

        // triangle current point
        let trianglePoint = curg.selectAll("."+TriangleCurPoint["class"]).data([triangleData.c]);
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

        infog.select("#event-label")
            .text("Event: "+ TriStatus[SelectTriStatus].event_type)
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(EventTextAttrs)) {
                    ele.attr(key, EventTextAttrs[key]);
                }
            });
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
        curg.selectAll("."+TriangleCurPoint["class"]).data([]).exit().remove();
        stackg.selectAll("."+StackCurPoint["class"]).data([]).exit().remove();
        infog.select("#event-label")
            .text("Event: None")
            .attr("opacity", 0);
    };

    that.init = function () {
        that.__init();
    }.call();
};