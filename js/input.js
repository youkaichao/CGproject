let Input = function() {
    let that = this;
    let enableInput = true;
    let svg = null;
    let inputg = null;
    let monoPlay = null;
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
        inputg = svg.append("g").attr("id", "input-g");

        $("#random-btn").click(function () {
            that.randomGenerate(randomLevel);
        });
        $("#clear-btn").click(function () {
            that.clear();
        });
        $("#randomlevel").on("input", function () {
            randomLevel = parseInt($(this).val());
            $("#form-label").text("Random Level: "+ randomLevel);
        });

        $("#load-btn").change(function () {
            let file = this.files && this.files[0];
            if (!file) {
                return;
            }
            let fileReader = new FileReader();
            fileReader.onload = function(e) {
                that.clear();
                let text = e.target.result;
                let points = JSON.parse(text);
                for(let point of points) {
                    that.addPoint(point);
                }
                that.update_view();
            };
            fileReader.readAsText(this.files[0]);
        })
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
        // draw points
                let points = inputg.selectAll("circle").data(SelectPoints, d=>d.id);
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
                            inputg.selectAll(".polyedge").attr("d", PolygonEdgeAttrs["d"])
                        }));
                points.exit().remove();

                // draw edges
                let polyedges = inputg.selectAll(".polyedge").data(PolygonEdges, d=>d.id);
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
    };

    that.clear = function() {
        PolygonEdgeAttrs["opacity"] = 1;
        enableInput = true;
        SelectPoints = [];
        PolygonEdges = [];
        that.update_view();
        monoPlay.clear();
    };

    that.randomGenerate = function(N=10) {
        that.clear();
        let points = [];
        for(let i = 0; i < N; ++i) {
            let point = {};
            point.angle = Math.random() * 2 * Math.PI;
            point.radius = Math.random() * 200 + 100;
            point.x = d3.select("#mainsvg").node().clientWidth/2 + point.radius * Math.cos(point.angle);
            point.y = d3.select("#mainsvg").node().clientHeight/2 + point.radius * Math.sin(point.angle);
            point.id = i;
            points.push(point);
        }
        points.sort((a, b) => a.angle - b.angle);
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