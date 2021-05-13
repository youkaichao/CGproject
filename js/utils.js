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

