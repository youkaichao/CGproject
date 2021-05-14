let MonoPlay = function () {
    let that = this;
    let svg = null;
    let monoG = null;

    that.__init = function() {
        svg = d3.select("#mainsvg");
        monoG = svg.append("g").attr("id", "mono-g");
    };

    that.update_view = function() {
        console.log("mono status:", MonoStatus[SelectMonoStatus]);
        // sweepline
        let sweepline = monoG.selectAll("#"+MonoSweeplineAttrs["id"]).data([MonoStatus[SelectMonoStatus]]);
        sweepline.enter()
            .append("path")
            .each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(MonoSweeplineAttrs)) {
                    ele.attr(key, MonoSweeplineAttrs[key]);
                }
            });
        sweepline.attr("d", MonoSweeplineAttrs["d"]);
        sweepline.exit().remove();
        // helper
        let helper = monoG.selectAll(".helper").data(MonoStatus[SelectMonoStatus].trapezoids);
        helper.enter()
            .append("circle")
            .each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(MonoHelperAttrs)) {
                    ele.attr(key, MonoHelperAttrs[key]);
                }
            });
        helper.each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(MonoHelperAttrs)) {
                    ele.attr(key, MonoHelperAttrs[key]);
                }
            });
        helper.exit().remove();
        // trapezoids construction
        let trapezoid_tmp = monoG.selectAll("."+TrapezoidTmpEdgeAttrs["class"]).data(MonoStatus[SelectMonoStatus].trapezoids);
        trapezoid_tmp.enter()
            .append("path")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidTmpEdgeAttrs)) {
                    ele.attr(key, TrapezoidTmpEdgeAttrs[key]);
                }
            });
        trapezoid_tmp
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidTmpEdgeAttrs)) {
                    ele.attr(key, TrapezoidTmpEdgeAttrs[key]);
                }
            });
        trapezoid_tmp.exit().remove();
        // trapezoids
        let trapezoid = monoG.selectAll("."+TrapezoidEdgeAttrs["class"]).data(MonoStatus[SelectMonoStatus].outputs);
        trapezoid.enter()
            .append("path")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidEdgeAttrs)) {
                    ele.attr(key, TrapezoidEdgeAttrs[key]);
                }
            });
        trapezoid
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidEdgeAttrs)) {
                    ele.attr(key, TrapezoidEdgeAttrs[key]);
                }
            });
        trapezoid.exit().remove();
    };

    that.step = function() {
        if(MonoStatus.length === 0) {
            if(SelectPoints.length === 0) {
                console.log("ERROR: can't decomposite monotone, points.length = 0");
                return
            }
            let [answer, events] = MonotoneDecomp(SelectPoints);
            MonoStatus = events;
            if(MonoStatus.length === 0) {
                console.log("ERROR: monotoneDecomp return empty events!");
                return;
            }
        }
        SelectMonoStatus = (SelectMonoStatus+1)%MonoStatus.length;
        that.update_view()
    };

    that.clear = function() {
        MonoStatus = [];
        SelectMonoStatus = -1;
        monoG.selectAll("#"+MonoSweeplineAttrs["id"]).data([]).exit().remove();
        monoG.selectAll(".helper").data([]).exit().remove();
        monoG.selectAll("."+TrapezoidTmpEdgeAttrs["class"]).data([]).exit().remove();
    };

    that.init = function () {
        that.__init();
    }.call();
};