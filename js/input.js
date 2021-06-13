let Input = function() {
    let that = this;
    let enableInput = true;
    let svg = null;
    let inputg = null;
    let nodeg = null;
    let edgeg = null;
    let infog = null;
    let monoPlay = null;
    let inputnodeg = null;
    let randomLevel = 30;


    that.connectMonoPlay = function(tmonoPlay) {
        monoPlay = tmonoPlay;
    };

    that.__init = function() {
        // enable input event
        $('#input-block-enable input').change(function() {
            // this will contain a reference to the checkbox
            if (this.checked) {
                console.log("enable input");
                enableInput = true;
            } else {
                console.log("disable input");
                enableInput = false;
            }
        });

        // input point
        svg = d3.select("#mainsvg")
            .on("click", function (e) {
                if(!enableInput) return;
                let id = SelectPoints.length;
                var newData= {
                    id: id,
                    x: Math.round(e.offsetX),
                    y: Math.round(e.offsetY),
                    from: null,
                    to: null
                };
                if(!that.addPoint(newData, true)) {
                    alert("You can't add points here!");
                }
                that.update_view()
            });
        inputg = svg.select("#input-g");
        edgeg = inputg.append("g").attr("id", "edge-g");
        nodeg = inputg.append("g").attr("id", "node-g");
        infog = svg.select("#infog").append("g").attr("id", "point-index-g");
        inputnodeg = svg.select("#input-node-g");

        $("#random-btn").click(function () {
            that.randomGenerate(randomLevel);
        });
        $("#clear-btn").click(function () {
            that.clear();
        });
        $("#randomlevel").on("input", function () {
            randomLevel = parseInt($(this).val());
            $("#form-label").text("Number of Random Points: "+ randomLevel);
        });

        $("#load-btn").on("input", function () {
            let file = this.files && this.files[0];
            let ele = this;
            if (!file) {
                return;
            }
            let fileReader = new FileReader();
            fileReader.onload = function(e) {
                ele.value = null;
                that.clear();
                let text = e.target.result;
                let points = JSON.parse(text);
                // points transform
                let width = d3.select("#mainsvg").node().clientWidth;
                let height = d3.select("#mainsvg").node().clientHeight;
                that.center_and_scale(points, width, height);
                let i=0;
                for(let point of points) {
                    point.id = i;
                    that.addPoint(point);
                    i++;
                }
                that.update_view();
            };
            fileReader.readAsText(this.files[0]);
        });
        $("#download-btn").click(function () {
            console.log("click download btn");
            let blob = new Blob([JSON.stringify(SelectPoints.map(d => {return {x:d.x,y:d.y}}), null, 4)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, `input-${SelectPoints.length}.json`);
        });
    };

    that.center_and_scale = function(points, width, height) {
        let minx=Number.MAX_SAFE_INTEGER;
        let maxx=Number.MIN_SAFE_INTEGER;
        let miny=Number.MAX_SAFE_INTEGER;
        let maxy=Number.MIN_SAFE_INTEGER;
        for(let point of points) {
            minx = Math.min(minx, point.x);
            maxx = Math.max(maxx, point.x);
            miny = Math.min(miny, point.y);
            maxy = Math.max(maxy, point.y);
        }
        let scale = Math.min(width*0.8/(Math.max(1, maxx-minx)), height*0.8/(Math.max(1, maxy-miny)));
        for(let point of points) {
            point.x = (point.x-(minx+maxx)/2)*scale+width/2;
            point.y = (point.y-(miny+maxy)/2)*scale+height/2;
        }
    };

    that.addPoint = function(newData, returnfalse = false) {
        //check if new point can be added
        let flag = true;
        let edgea = {
            source: SelectPoints[SelectPoints.length-1],
            target: newData
        };
        let edgeb = {
            source: newData,
            target: SelectPoints[0]
        };
        for(let edgeidx=0; edgeidx<PolygonEdges.length-1; edgeidx++) {
            if(isLineIntersect(edgea, PolygonEdges[edgeidx])) {
                flag = false;
                if(returnfalse) return;
            }
        }
        // update data
        SelectPoints.push(newData);
        SelectPointsDict[newData.id] = newData;
        if (SelectPoints.length===2) {
            PolygonEdges.push({
                id:SelectPoints[0].id+","+SelectPoints[1].id,
                source:SelectPoints[0],
                target:SelectPoints[1]
            });
            PolygonEdges.push({
                id:SelectPoints[1].id+","+SelectPoints[0].id,
                source:SelectPoints[1],
                target:SelectPoints[0]
            });
            SelectPoints[0].from = PolygonEdges[0];
            SelectPoints[0].to = PolygonEdges[1];
            SelectPoints[1].from = PolygonEdges[1];
            SelectPoints[1].to = PolygonEdges[0];
        } else if (SelectPoints.length>2) {
            PolygonEdges.splice(PolygonEdges.length-1, 1, {
                id:SelectPoints[SelectPoints.length-2].id+","+SelectPoints[SelectPoints.length-1].id,
                source: SelectPoints[SelectPoints.length-2],
                target: SelectPoints[SelectPoints.length-1]
            });
            PolygonEdges.push({
                id:SelectPoints[SelectPoints.length-1].id+","+SelectPoints[0].id,
                source: SelectPoints[SelectPoints.length-1],
                target: SelectPoints[0]
            });
            SelectPoints[SelectPoints.length-2].from = PolygonEdges[PolygonEdges.length-2];
            SelectPoints[SelectPoints.length-1].to = PolygonEdges[PolygonEdges.length-2];
            SelectPoints[SelectPoints.length-1].from = PolygonEdges[PolygonEdges.length-1];
            SelectPoints[0].to =  PolygonEdges[PolygonEdges.length-1];
        }
        return flag;
    };

    that.update_view = function() {
        // draw edges
        let polyedges = edgeg.selectAll(".polyedge").data(PolygonEdges, d=>d.id);
        polyedges.enter()
            .append("path")
            .each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(PolygonEdgeAttrs)) {
                    ele.attr(key, PolygonEdgeAttrs[key]);
                }
            })
            .on("mouseover", function () {
                let ele = d3.select(this);
                ele.attr("stroke-width", 6);
            })
            .on("mouseout", function () {
                let ele = d3.select(this);
                ele.attr("stroke-width", PolygonEdgeAttrs["stroke-width"]);
            })
            .on("click", function (e,d) {
                console.log("click edge");
                e.stopPropagation();
                let newData= {
                    id: SelectPoints.length,
                    x: Math.round(e.offsetX),
                    y: Math.round(e.offsetY)
                };
                let idx = SelectPoints.indexOf(d.source)+1;
                SelectPoints.splice(idx, 0, newData);
                let removeEdge = PolygonEdges.splice(PolygonEdges.indexOf(d), 1)[0];
                PolygonEdges.push({
                    id:removeEdge.source.id+","+newData.id,
                    source: removeEdge.source,
                    target: newData
                });
                PolygonEdges.push({
                    id: newData.id+","+removeEdge.target.id,
                    source: newData,
                    target: removeEdge.target
                });
                removeEdge.source.from = PolygonEdges[PolygonEdges.length-2];
                newData.to = PolygonEdges[PolygonEdges.length-2];
                newData.from = PolygonEdges[PolygonEdges.length-1];
                removeEdge.target.to = PolygonEdges[PolygonEdges.length-1];
                that.update_view();
            });
        polyedges
            .each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(PolygonEdgeAttrs)) {
                    ele.attr(key, PolygonEdgeAttrs[key]);
                }
            });
        polyedges.exit().remove();

        // draw points
        let points = inputnodeg.selectAll("circle").data(SelectPoints, d=>d.id);
        points.enter()
            .append("circle")
            .each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(PointAttrs)) {
                    ele.attr(key, PointAttrs[key]);
                }
            })
            .on("mouseover", function () {
                let ele = d3.select(this);
                ele.attr("r", 8);
            })
            .on("mouseout", function () {
                let ele = d3.select(this);
                ele.attr("r", PointAttrs["r"]);
            })
            .call(d3.drag()
                .on("drag", function (e, d) {
                    // e.stopPropagation();
                    if(!enableInput) return;
                    let ele = d3.select(this);
                    ele.attr("cx", d.x = e.x)
                        .attr("cy", d.y = e.y);
                    edgeg.selectAll(".polyedge").attr("d", PolygonEdgeAttrs["d"]);
                    infog.selectAll("."+IndexTextAttrs["class"]).attr("x", IndexTextAttrs["x"]);
                    infog.selectAll("."+IndexTextAttrs["class"]).attr("y", IndexTextAttrs["y"]);
                }));
        points.exit().remove();

        // draw texts
        let texts = infog.selectAll("."+IndexTextAttrs["class"]).data(SelectPoints, d=>d.id);
        texts.enter()
            .append("text")
            .text(d => d.id)
            .each(function (d) {
                let ele = d3.select(this);
                for(let key of Object.keys(IndexTextAttrs)) {
                    ele.attr(key, IndexTextAttrs[key]);
                }
            });
        texts.exit().remove();
    };

    that.clear = function() {
        PolygonEdgeAttrs["opacity"] = 1;
        enableInput = true;
        SelectPoints = [];
        SelectPointsDict = {};
        PolygonEdges = [];
        that.update_view();
        monoPlay.clear();
    };

    that.randomGenerate = function(N=10) {
        that.clear();
        let points = [];
        for(let i = 0; i < N; ++i) {
            let point = {};
            while (true) {
                point.angle = Math.random() * 2 * Math.PI;
                let fineangle = true;
                for(let p of points) {
                    if(Math.abs(p.angle-point.angle)<5/360*2*Math.PI){
                        fineangle = false;
                        break;
                    }
                }
                if(fineangle) break;
            }
            point.radius = Math.random() * 200 + 100;
            point.x = point.radius * Math.cos(point.angle);
            point.y = point.radius * Math.sin(point.angle);
            points.push(point);
        }
        points.sort((a, b) => a.angle - b.angle);
        // points transform
        let width = d3.select("#mainsvg").node().clientWidth;
        let height = d3.select("#mainsvg").node().clientHeight;
        that.center_and_scale(points, width, height);
        for(let i=0; i<points.length; i++) {
            let u = points[(i+points.length-1)%points.length];
            let p = points[i];
            let v = points[(i+1)%points.length];
            while((distance(u,p)<PointR*3) || (distance(v,p)<PointR*3)) {
                p.x += Math.cos(p.angle);
                p.y += Math.sin(p.angle);
            }
            p.id = i;
        }

        for(let point of points) {
            that.addPoint(point);
        }
        that.update_view();
    };

    that.enableInput = function(flag) {
        enableInput = flag;
    };

    that.init = function () {
        that.__init();
    }.call();
};