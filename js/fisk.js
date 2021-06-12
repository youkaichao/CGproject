let FiskPlay = function () {
    let that = this;
    let svg = null;
    let fiskG = null;
    let triplay = null;
    let infog = null;
    let answer = [];
    let events = [];
    let fiskStatus = -1;

    that.__init = function() {
        svg = d3.select("#mainsvg");
        infog = svg.select("#infog");
        fiskG = svg.select("#fisk-g");

        $("#fisk-next-comp-btn").click(() => {that.step(0)});
        $("#fisk-last-comp-btn").click(() => {that.step(1)});
        $("#fisk-start-comp-btn").click(() => {that.step(2)});
        $("#fisk-end-comp-btn").click(() => {that.step(3)});

    };

    that.isPlaying = function() {
        return events.length>0
    };

    that.connectTriangulationView = function(ttri) {
        triplay = ttri;
    };

    that.update_view = function() {
        let points = events[fiskStatus];
        // triangle pieces
        let fiskpoints = fiskG.selectAll("."+FiskPointAttrs["class"]).data(points);
        fiskpoints.enter()
            .append("circle")
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(FiskPointAttrs)) {
                    ele.attr(key, FiskPointAttrs[key]);
                }
            });
        fiskpoints
            .each(function (d, i) {
                let ele = d3.select(this);
                for(let key of Object.keys(FiskPointAttrs)) {
                    ele.attr(key, FiskPointAttrs[key]);
                }
            });
        fiskpoints.exit().remove();
    };

    that.step = function(flag = 0) {
        //0: next, 1: last, 2: start, 3: end
        if(SelectMonoStatus!==MonoStatus.length-1) return;
        if(MonoStatus.length === 0) {
            alert("No simple polygon selected to show triangulation");
            return
        }
        if(events.length === 0) {
            that.showAllTriangulation();
            let triangles = triplay.getLastTriangleBuffer().map(d => d.points);
            [answer, events] = that.fisk(triangles);
            fiskStatus = -1;
        }
        // clear text
        svg.selectAll("."+TrapezoidIndex['class']).data([]).exit().remove();
        if (flag===0)
            fiskStatus = (fiskStatus+1)%events.length;
        else if(flag===1)
            fiskStatus = (fiskStatus+events.length-1)%events.length;
        else if(flag===2)
            fiskStatus = 0;
        else if(flag===3)
            fiskStatus = events.length-1;
        that.update_view()
    };

    that.showAllTriangulation = function() {
        // mono decomp not finish
        if(SelectMonoStatus<MonoStatus.length-1) return;
        triplay.clear();
        TriangulationUseBuffer = true;
        d3.selectAll("."+TrapezoidEdgeAttrs["class"]).attr("opacity", 0);
        for(let d of MonoStatus[MonoStatus.length-1].outputs) {
            let [answer, events] = TriangulatingMonotonePolygon(d.points);
            TriAnswer = answer;
            TriStatus = events;
            SelectTriStatus = -1;
            SelectMonoTriId = DecompIDtoIdx[d.id];
            triplay.step(3);
        }
        TriangulationUseBuffer = false;
        infog.select("#event-label")
            .text("Event: None")
            .attr("opacity", 0);
        d3.selectAll("."+TriangleCurPoint["class"]).data([]).exit().remove();
    };

    that.fisk = function(triangles) {
        let graphdcel = getGraph(triangles);
        let answer = [];
        let events = [];
        let pointid2color = {};
        let visited = {};
        // init a face
        for(let i=0; i<triangles[0].length; i++) {
            let point = triangles[0][i];
            point.c = i;
            pointid2color[point.id] = i;
        }
        events.push(triangles[0]);
        // BFS
        let queue = JSON.parse(JSON.stringify(graphdcel[0]));
        visited[0]=true;
        while (queue.length > 0) {
            let faceid = queue.shift();
            visited[faceid] = true;
            for(let neighborid of graphdcel[faceid]) {
                if(!visited[neighborid]) {
                    visited[neighborid] = true;
                    queue.push(neighborid);
                }
            }
            let uncolored = null;
            let colorsum = 0;
            for(let point of triangles[faceid]) {
                if(pointid2color[point.id]===undefined) uncolored = point;
                else colorsum += pointid2color[point.id]
            }
            uncolored.c = 3-colorsum;
            pointid2color[uncolored.id] = uncolored.c;
            let event = events[events.length-1].slice(0, events[events.length-1].length);
            event.push(uncolored);
            events.push(event);
        }
        answer = events[events.length-1];
        return [answer, events]
    };

    that.clear = function() {
        answer = [];
        events = [];
        fiskG.selectAll("."+FiskPointAttrs["class"]).data([]).exit().remove();
    };

    that.init = function () {
        that.__init();
    }.call();
};