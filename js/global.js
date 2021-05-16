SelectPoints = [];
PolygonEdges = [];
MonoStatus = [];
DecompIDtoIdx = {};
SelectMonoStatus = -1;
PointAttrs = {
    class: "point",
    r: 5,
    cx: d => d.x,
    cy: d => d.y
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
    stroke: "red",
    d: d => {
        let pathd = `M ${d.points[0].x} ${d.points[0].y}`;
        for(let i=1; i<d.points.length; i++) {
            pathd+=`L ${d.points[i].x} ${d.points[i].y}`
        }
        return pathd
    },
    fill: "rgb(127, 127, 127)",
    opacity: d => Math.max(0.1, 1-DecompIDtoIdx[d.id]*0.2),
    "stroke-width": 0,
};