let MonoPlay = function () {
    let that = this;
    let svg = null;
    let infog = null;
    let monoG = null;
    let sweeplineg = null;
    let helperg = null;
    let trapezoidg = null;
    let textg = null;
    let nodeg = null;

    let inputview = null;
    let triview = null;

    that.__init = function() {
        svg = d3.select("#mainsvg");
        monoG = svg.select("#mono-g");
        infog = svg.select("#infog");
        nodeg = svg.select("#middle-node-g");

        trapezoidg = monoG.append("g").attr("id", "trapezoid-g");
        helperg = nodeg.append("g").attr("id", "mono-helper-g");
        textg = monoG.append("g").attr("id", "text-g");
        sweeplineg = monoG.append("g").attr("id", "sweepline-g");

        $("#next-comp-btn").click(() => {that.step(0)});
        $("#last-comp-btn").click(() => {that.step(1)});
        $("#start-comp-btn").click(() => {that.step(2)});
        $("#end-comp-btn").click(() => {that.step(3)});

    };

    that.connectInputview = function(tinput) {
        inputview = tinput;
    };

    that.connectTriView = function(tri) {
        triview = tri;
    };

    that.update_view = function() {
        // sweepline
        let sweepline = sweeplineg.selectAll("#"+MonoSweeplineAttrs["id"]).data([MonoStatus[SelectMonoStatus]]);
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
        let helper = helperg.selectAll(".helper").data(MonoStatus[SelectMonoStatus].trapezoids);
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
        let trapezoid_tmp = trapezoidg.selectAll("."+TrapezoidTmpEdgeAttrs["class"]).data(MonoStatus[SelectMonoStatus].trapezoids);
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
        let leftEdges = MonoStatus[SelectMonoStatus].trapezoids.reduce(function (acc, cur) {
            return acc.concat([
                {source: cur.points[0], target: cur.points[1]},
                {source: cur.points[cur.points.length-2], target: cur.points[cur.points.length-1]}
            ])
        }, []);
        let trapezoid_tmp_left = trapezoidg.selectAll("."+TrapezoidTmpEdgeAttrsLeft["class"]).data(leftEdges);
        trapezoid_tmp_left.enter()
            .append("path")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidTmpEdgeAttrsLeft)) {
                    ele.attr(key, TrapezoidTmpEdgeAttrsLeft[key]);
                }
            });
        trapezoid_tmp_left
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidTmpEdgeAttrsLeft)) {
                    ele.attr(key, TrapezoidTmpEdgeAttrsLeft[key]);
                }
            });
        trapezoid_tmp_left.exit().remove();
        // trapezoids
        let trapezoid = trapezoidg.selectAll("."+TrapezoidEdgeAttrs["class"]).data(MonoStatus[SelectMonoStatus].outputs);
        trapezoid.enter()
            .append("path")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidEdgeAttrs)) {
                    ele.attr(key, TrapezoidEdgeAttrs[key]);
                }
            })
            .on("mouseover", function (e, d) {
                if(d.id === SelectMonoTriId) return;
                let ele = d3.select(this);
                ele.attr("opacity", 0.6);
            })
            .on("mouseout", function (e, d) {
                if(d.id === SelectMonoTriId) return;
                let ele = d3.select(this);
                ele.attr("opacity", TrapezoidEdgeAttrs["opacity"]);
            })
            .on("click", function (e, d) {
                if(SelectMonoStatus<MonoStatus.length-1) return;
                monoG.selectAll("."+TrapezoidEdgeAttrs["class"]).attr("opacity", TrapezoidEdgeAttrs["opacity"]);
                triview.clear();
                let ele = d3.select(this);
                ele.attr("opacity", 0);
                let [answer, events] = TriangulatingMonotonePolygon(d.points);
                TriAnswer = answer;
                console.log("triangulation answer:", answer);
                console.log("triangulation events:", events);
                TriStatus = events;
                SelectTriStatus = -1;
                SelectMonoTriId = DecompIDtoIdx[d.id];
                $("#tri-label").text("Selected Trapezoid: "+SelectMonoTriId);
            });
        trapezoid
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidEdgeAttrs)) {
                    ele.attr(key, TrapezoidEdgeAttrs[key]);
                }
            });
        trapezoid.exit().remove();
        // trapezoid text
        let trapezoidText = textg.selectAll("."+TrapezoidIndex['class']).data(MonoStatus[SelectMonoStatus].outputs);
        trapezoidText.enter()
            .append("text")
            .text(d => DecompIDtoIdx[d.id])
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidIndex)) {
                    ele.attr(key, TrapezoidIndex[key]);
                }
            });
        trapezoidText
            .text(d => DecompIDtoIdx[d.id])
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(TrapezoidIndex)) {
                    ele.attr(key, TrapezoidIndex[key]);
                }
            });
        trapezoidText.exit().remove();

        infog.select("#event-label")
            .text("Event: "+ MonoStatus[SelectMonoStatus].event_type)
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(EventTextAttrs)) {
                    ele.attr(key, EventTextAttrs[key]);
                }
            });
    };

    that.step = function(flag = 0) {
        //0: next, 1: last, 2: start, 3: end
        inputview.enableInput(false);
        PolygonEdgeAttrs["opacity"] = 0.2;
        inputview.update_view();
        if(MonoStatus.length === 0) {
            if(SelectPoints.length === 0) {
                console.log("ERROR: can't decomposite monotone, points.length = 0");
                return
            }
            let answer, events, succeed;
            for (let i=0; i<5; i++) {
                [answer, events] = MonotoneDecomp(SelectPoints);
                let results = [];
                answer.forEach(each => {
                    let t = new Trapezoid();
                    t.chain = each;

                    let [triangulations, events] = TriangulatingMonotonePolygon(each);
                    results = results.concat(triangulations);
                });
                succeed = (checkTriangulate(SelectPoints, results));
                if (succeed) break;
            }
            if (!succeed) {
                alert("错误的输入。请保证点之间不能太近，以及输入的是简单多边形");
                return
            }


            PolyAnswer = answer;
            console.log("mono decomp result:", answer, events);
            let finaloutputs = [];
            for(let i=0; i<PolyAnswer.length; i++) {
                finaloutputs.push({
                    id:i,
                    points:PolyAnswer[i]
                })
            }
            events.push({
                event_type:"",
                outputs: finaloutputs,
                sweepline: 5000,
                trapezoids:[]
            });
            MonoStatus = events;
            if(MonoStatus.length === 0) {
                console.log("ERROR: monotoneDecomp return empty events!");
                return;
            }
        }
        DecompIDtoIdx = {};
        for(let idx=0; idx<MonoStatus[MonoStatus.length-2].outputs.length; idx++) {
            DecompIDtoIdx[MonoStatus[MonoStatus.length-2].outputs[idx].id] = idx;
        }
        triview.clear();
        if (flag===0)
            SelectMonoStatus = (SelectMonoStatus+1)%MonoStatus.length;
        else if(flag===1)
            SelectMonoStatus = (SelectMonoStatus+MonoStatus.length-1)%MonoStatus.length;
        else if(flag===2)
            SelectMonoStatus = 0;
        else if(flag===3)
            SelectMonoStatus = MonoStatus.length-1;
        if(SelectMonoStatus===MonoStatus.length-1) {
            DecompIDtoIdx = {};
            for(let idx=0; idx<MonoStatus[MonoStatus.length-1].outputs.length; idx++) {
                DecompIDtoIdx[MonoStatus[MonoStatus.length-1].outputs[idx].id] = idx;
            }
        }
        that.update_view()
    };

    that.clear = function() {
        triview.clear();
        MonoStatus = [];
        SelectMonoStatus = -1;
        monoG.selectAll("#"+MonoSweeplineAttrs["id"]).data([]).exit().remove();
        helperg.selectAll(".helper").data([]).exit().remove();
        monoG.selectAll("."+TrapezoidTmpEdgeAttrs["class"]).data([]).exit().remove();
        monoG.selectAll("."+TrapezoidTmpEdgeAttrsLeft["class"]).data([]).exit().remove();
        monoG.selectAll("."+TrapezoidEdgeAttrs["class"]).data([]).exit().remove();
        monoG.selectAll("."+TrapezoidIndex['class']).data([]).exit().remove();
        infog.select("#event-label")
            .text("Event: None")
            .attr("opacity", 0);
    };

    that.init = function () {
        that.__init();
    }.call();
};