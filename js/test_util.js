function full_test(_points) {
    let points = [];
    let fiskanswer = [];
    if((typeof _points) === "number") {
        let N = _points;
        points = [];
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
    } else {
        points = _points;
    }
    let start = Date.now();
    let triangles = Triangulate(points);
    let correct = checkTriangulate(points, triangles);
    console.log("triangulation correctness:", correct);
    let end = Date.now();
    console.log(`triangle running time:${end-start}ms`);

    start = end;
    [fiskanswer, events] = fiskPlay.fisk(triangles);
    end = Date.now();
    console.log(`fisk color running time:${end-start}ms`);
    return [triangles, fiskanswer];
}