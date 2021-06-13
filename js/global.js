SelectPoints = [];
SelectPointsDict = {};
PolygonEdges = [];
MonoStatus = [];
PolyAnswer = [];
DecompIDtoIdx = {};
SelectMonoStatus = -1;
TriangulationUseBuffer = false;

TriAnswer = null;
SelectMonoTriId = -1;
TriStatus = [];
SelectTriStatus = -1;
// 1.
// TrapezoidColorThemes = ["#ffcbf2","#f3c4fb","#ecbcfd","#e5b3fe","#e2afff","#deaaff","#d8bbff"];
// TriangleColorSchemes = ["#edf2fb","#e2eafc","#d7e3fc","#ccdbfd","#c1d3fe","#b6ccfe","#abc4ff"];
// 2.
// TrapezoidColorThemes = ["#86e3ce", "#d0e6a5", "#ffdd94", "#fab97b", "#ccabd8"];
// TriangleColorSchemes = ["#85cbcc", "#a8dee0", "#f9e2ae", "#fbc78d", "#a7d676"];
// 3.
// TrapezoidColorThemes = ["#60efd8", "#bef2e5", "#c5e7f7", "#79ceed", "#6f89a2"];
// TriangleColorSchemes = ["#5aa7a7", "#96d7c6", "#bac94a", "#e2d36b", "#6c8cbf"];
// 4.
// TrapezoidColorThemes = ["#ff7b89", "#ba5082", "#6f5f90", "#758eb7", "#a5cad2"];
// TriangleColorSchemes = ["#47cacc", "#63bcc9", "#cdb3d4", "#e7b7c8", "#ffbe88"];

TrapezoidColorThemes = ["#ff7b89", "#ba5082", "#6f5f90", "#758eb7", "#a5cad2"];
TriangleColorSchemes = ["#ff7b89", "#ba5082", "#6f5f90", "#758eb7", "#a5cad2"];
PointR = 8;
//     LAYOUT     ATTRS          //
PointAttrs = {
    class: "point",
    r: PointR,
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
    r: PointR,
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
    "stroke-width": 2,
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
    "stroke-width": 2,
};
TrapezoidEdgeAttrs = {
    class: "trapezoid-edge",
    stroke: "rgb(127,127,127)",
    "stroke-opacity": 0,
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
EventTextAttrs = {
    "font-size": "20px",
    "text-anchor": "start",
    "font-style": "italic",
    fill: "rgb(127,127,127)",
    x: 10,
    y: 30,
    opacity: 1
};
TrapezoidIndex = {
    class: "trapezoid-index",
    "font-size": "20px",
    "text-anchor": "middle",
    fill: "#FFE4B5",
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
        return sum_y/d.points.length+10
    }
};
TriangleAttrs = {
    class: "triangle-piece",
    fill: d => TriangleColorSchemes[d.id%TriangleColorSchemes.length],
    opacity: 1,
    d: d => {
        let ps = d.points;
        return `M ${ps[0].x} ${ps[0].y} L ${ps[1].x} ${ps[1].y} L ${ps[2].x} ${ps[2].y} Z`
    }
};
TriangleCurPoint = {
    class: "tri-cur-point",
    fill: "red",
    r: PointR,
    cx: d=>d.x,
    cy: d=>d.y
};
FiskColors=["#FF0000", "#FF8C00", "#228B22"];
FiskPointAttrs = {
    class: "fiskPoint",
    r: PointR,
    cx: d => d.x,
    cy: d => d.y,
    fill: d => FiskColors[d.c]
};
IndexTextAttrs = {
    class: "index-text",
    "font-size": "8px",
    "font-weight": "bold",
    "text-anchor": "middle",
    // "font-style": "italic",
    fill: "white",
    x: d => SelectPointsDict[d.id].x,
    y: d => SelectPointsDict[d.id].y+4,
    opacity: 1
};