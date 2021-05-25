SelectPoints = [];
PolygonEdges = [];
MonoStatus = [];
PolyAnswer = [];
DecompIDtoIdx = {};
SelectMonoStatus = -1;
TrapezoidColorThemes = ["#ffcbf2","#f3c4fb","#ecbcfd","#e5b3fe","#e2afff","#deaaff","#d8bbff"];

TriAnswer = null;
SelectMonoTriId = -1;
TriStatus = [];
SelectTriStatus = -1;
ColorSchemes = ["#edf2fb","#e2eafc","#d7e3fc","#ccdbfd","#c1d3fe","#b6ccfe","#abc4ff"];
//     LAYOUT     ATTRS          //
PointAttrs = {
    class: "point",
    r: 3,
    cx: d => d.x,
    cy: d => d.y,
    fill: "rgb(127,127,127)"
};
PolygonEdgeAttrs = {
    class: "polyedge",
    d: d=>`M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`,
    opacity: 1,
    stroke: "black",
    "stroke-width": 2
};
MonoSweeplineAttrs = {
    id: "sweepline",
    d: d => `M 0 ${d.sweepline} L 4000 ${d.sweepline}`,
    stroke: "black",
    "stroke-width": 1,
    "stroke-dasharray": "5, 5"
};
MonoHelperAttrs = {
    class: "helper",
    fill: "red",
    r: 5,
    cx: d => d.helper.x,
    cy: d => d.helper.y
};
TrapezoidTmpEdgeAttrs = {
    class: "trapezoid-tmp-edge",
    stroke: "black",
    d: d => {
        let pathd = `M ${d.points[1].x} ${d.points[1].y}`;
        for(let i=2; i<d.points.length-1; i++) {
            pathd+=`L ${d.points[i].x} ${d.points[i].y}`
        }
        return pathd
    },
    fill: "none",
    // opacity: d => Math.max(0.1, 1-d.id*0.2),
    "stroke-width": 4,
};
TrapezoidTmpEdgeAttrsLeft = {
    class: "trapezoid-tmp-edge-left",
    stroke: "black",
    d: d => {
        return `M ${d.source.x} ${d.source.y}` + `L ${d.target.x} ${d.target.y}`
    },
    fill: "none",
    "stroke-dasharray": "5,5",
    // opacity: d => Math.max(0.1, 1-d.id*0.2),
    "stroke-width": 4,
};
TrapezoidEdgeAttrs = {
    class: "trapezoid-edge",
    stroke: "rgb(127,127,127)",
    "stroke-opacity": 0,
    "stroke-width": 4,
    d: d => {
        let pathd = `M ${d.points[0].x} ${d.points[0].y}`;
        for(let i=1; i<d.points.length; i++) {
            pathd+=`L ${d.points[i].x} ${d.points[i].y}`
        }
        return pathd
    },
    fill: d => TrapezoidColorThemes[DecompIDtoIdx[d.id]%TrapezoidColorThemes.length],
    opacity: 1,
};
TrapezoidIndex = {
    class: "trapezoid-index",
    "font-size": "20px",
    "text-anchor": "middle",
    fill: "#CDB5CD",
    x: d => {
        let sum_x = 0;
        for(let i=0; i<d.points.length; i++) {
            sum_x += d.points[i].x;
        }
        return sum_x/d.points.length
    },
    y: d => {
        let sum_y = 0;
        for(let i=0; i<d.points.length; i++) {
            sum_y += d.points[i].y;
        }
        return sum_y/d.points.length
    }
};
TriangleAttrs = {
    class: "triangle-piece",
    fill: d => ColorSchemes[d.id%ColorSchemes.length],
    opacity: 0.8,
    d: d => {
        let ps = d.points;
        return `M ${ps[0].x} ${ps[0].y} L ${ps[1].x} ${ps[1].y} L ${ps[2].x} ${ps[2].y} Z`
    }
};
TriangleCurPoint = {
    class: "tri-cur-point",
    fill: "red",
    r: 5,
    cx: d=>d.x,
    cy: d=>d.y
};