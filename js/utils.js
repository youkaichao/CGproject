function toLeft(start, end, point) {
    let a = {'x': end.x - start.x, 'y': end.y - start.y};
    let b = {'x': point.x - end.x, 'y': point.y - end.y};
    let ans = a.x * b.y - a.y * b.x;
    if(ans === 0)
    {
        return 0;
    }
    if(ans < 0)
    {
        return 1;
    }
    if(ans > 0)
    {
        return -1;
    }
}

function isLineIntersect(linea, lineb) {
    return !((toLeft(linea.source, linea.target, lineb.source)*toLeft(linea.source, linea.target, lineb.target)>=0)||
        (toLeft(lineb.source, lineb.target, linea.source)*toLeft(lineb.source, lineb.target, linea.target)>=0))
}

function distance(a, b) {
    return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y))
}

function findNearestDistance(points) {
    let n = points.length;
    let mindis = Number.MAX_SAFE_INTEGER;
    let minpoints = null;
    for(let i=0; i<n; i++) {
        for(let j=i+1; j<n; j++) {
            let dis = distance(points[i], points[j]);
            if(mindis>dis) {
                mindis = dis;
                minpoints = [i, j];
            }
        }
    }
    console.log("mindis:", mindis, minpoints);
}