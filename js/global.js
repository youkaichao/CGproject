SelectPoints = [];
PolygonEdges = [];
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