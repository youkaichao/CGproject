SelectPoints = [];
PolygonEdges = [];
MonoStatus = [];
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
    stroke: "red",
    d: d => {
        let pathd = `M ${d.points[1].x} ${d.points[1].y}`;
        for(let i=2; i<d.points.length-1; i++) {
            pathd+=`L ${d.points[i].x} ${d.points[i].y}`
        }
        return pathd
    },
    fill: "rgb(127, 127, 127)",
    opacity: d => (1-d.idx*0.2),
    "stroke-width": 0,
};