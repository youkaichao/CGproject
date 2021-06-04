width = 1000;
height = 1000;
center = 500;

function drawPoly(ctx, points, color='red') {
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < points.length; ++i)
    {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[0].x, points[0].y);
    ctx.stroke();
    // ctx.fill();
}

// 算法代码正式开始,返回1代表左边，是在屏幕坐标系下，但是以人的感觉的左边

function point_equal(a, b) {
    return a.x === b.x && a.y === b.y;
}


function negateP(p) {
    return {'x': - p.x, 'y': -p.y, 'id': p.id};
}

let tid = 0;

class Trapezoid {
    constructor(vertex=null, prev=null, next=null) {
        this.id = tid;
        tid += 1;
        if(vertex === null)
        {
            this.chain = null;
            this.helper = null;
        }else{
            this.helper = vertex;
            if(toLeft(vertex, prev, next) > 0)
            {
                this.chain = [prev, vertex, next];
            }else{
                this.chain = [prev, vertex, next].reverse();
            }
        }
    }

    get head(){
        return this.chain[0];
    }

    get second_head(){
        return this.chain[1];
    }

    get tail(){
        return this.chain[this.chain.length - 1];
    }

    get second_tail(){
        return this.chain[this.chain.length - 2];
    }

    draw(ctx){
        drawPoly(ctx, this.chain);
    }

    in_test(point) {
        return toLeft(this.second_head, this.head, point) >= 0 && toLeft(this.second_tail, this.tail, point) <= 0;
    }

    merge(t1, t2){
        if(point_equal(t1.head, t2.tail))
        {
            let t = t2;
            t2 = t1;
            t1 = t;
        }
        // t1 在左, t2 在右
        let ans_id = t1.chain.length > t2.chain.length ? t1.id : t2.id;
        this.helper = t1.tail;
        this.chain = t1.chain.concat(t2.chain.slice(1));
        this.id = ans_id;
    }

    split(p, prev, next)
    {
        let t1 = new Trapezoid(), t2 = new Trapezoid();
        let index = [...Array(this.chain.length).keys()].filter(i => point_equal(this.helper, this.chain[i]))[0];

        let [left, right] = [prev, next];
        if(toLeft(p, prev, next) < 0)
        {
            [left, right] = [next, prev];
        }
        t1.helper = p; 
        t1.chain = this.chain.slice(0, index + 1).concat([p, left]);

        t2.helper = p;
        t2.chain = [right, p].concat(this.chain.slice(index));
        return [t1, t2];
    }
}

function onePass(points) {
    let events = [];
    // 按照y坐标升序排列，屏幕方向从上到下
    let indices = [...Array(points.length).keys()];
    indices.sort((a, b) => points[a].y - points[b].y);

    let sweepline = []; // 扫描线，用于存放四边形
    let output = []; // 存放切出来的多边形（多边形的形式是 point array）

    function generateEvent(point, name) {
        return {
            'event_type': name,
            'sweepline': point.y,
            'outputs': output.map(t => ({'id': t.id, 'points': t.chain.map(p => ({'x': p.x, 'y': p.y, 'id': p.id}))})),
            'trapezoids': sweepline.map(t => ({'id': t.id, 'helper': {'x': t.helper.x, 'y': t.helper.y}, 'points': t.chain.map(p => ({'x': p.x, 'y': p.y, 'id': p.id}))}))
        };
    }

    for(let i = 0; i < indices.length; ++i)
    {
        // in_ts 表示包含p的四边形 
        let index = indices[i];
        let p = points[index];
        let in_ts = sweepline.map((v, i) => [v, i]).filter(e => e[0].in_test(p));

        // 取出p两边的点
        let prev = (index + points.length - 1) % points.length;
        prev = points[prev];
        let next = (index + 1) % points.length;
        next = points[next];

        // p 代表一个新的四边形，则两边的点还没check，比它低
        if(in_ts.length === 0)
        {
            sweepline.push(new Trapezoid(p, prev, next));
            events.push(generateEvent(p, 'insert'));
        }
        else if(in_ts.length === 1)
        {
            let [t, t_index] = in_ts[0];
            if(point_equal(p, t.head) && point_equal(p, t.tail))
            {// 四边形封闭了
                sweepline.splice(t_index, 1);
                t.chain.splice(0, 1);
                output.push(t);
                events.push(generateEvent(p, 'output'));
            }
            else if(point_equal(p, t.head))
            {// 是左边的虚顶点
                t.helper = p;
                t.chain.splice(0, 0, (prev.y > next.y ? prev : next));
                events.push(generateEvent(p, 'left'));
            }
            else if(point_equal(p, t.tail))
            {// 是右边的虚顶点
                t.helper = p;
                t.chain.push(prev.y > next.y ? prev : next);
                events.push(generateEvent(p, 'right'));
            }else{
                // 在四边形内部，该split了
                let [t1, t2] = t.split(p, next, prev);
                sweepline.splice(t_index, 1, t1, t2);
                events.push(generateEvent(p, 'split'));
            }
        }
        else if(in_ts.length === 2)
        {// 两个T要merge
            let [t1, t1_index] = in_ts[0];
            let [t2, t2_index] = in_ts[1];
            sweepline.splice(t1_index, 1);
            sweepline.splice(t2_index - 1, 1);
            let s = new Trapezoid();
            s.merge(t1, t2);
            sweepline.push(s);
            events.push(generateEvent(p, 'merge'));
        }
    }
    return [output, events];
}

function MonotoneDecomp(points) {
    // init points id
    for(let id=0; id<points.length; id++) {
        points[id].id = id;
    }
    let [output, events] = onePass(points);
    let answer = [];
    output.forEach(t1 => {
        onePass(t1.chain.map(negateP))[0].forEach(t2 => {
            answer.push(t2.chain.map(negateP));
        });
    });
    return [answer, events];
}

function isReflex(s, t, c) {
    // TODO handle collinear
    if (c.position === "left") {
        return toLeft(s, t, c) === -1 || toLeft(s, t, c) === 0;
    } else {
        return toLeft(s, t, c) === 1 || toLeft(s, t, c) === 0;
    }
}

function CCW(a, b, c) {
    if (toLeft(a, b, c)===1) {
        return [a, b, c];
    } else {
        return [c, b, a];
    }

}

function TriangulatingMonotonePolygon(points) {
    points = Object.assign([], points);
    let output = []; // 存放切出来的三角形（三角形的形式是 point array）
    let events = [];

    function generateEvent(point, name, c, stack) {
        return {
            'event_type': name,
            'outputs': output.map(ps => ({'points': ps.map(p => ({'x': p.x, 'y': p.y, 'id': p.id}))})),
            'c': {'x': c.x, 'y': c.y, 'id': c.id}, // the current vertex
            'stack': stack.map(p => ({'x': p.x, 'y': p.y, 'id': p.id})),
        };
    }

    // TODO handle same y coordinates
    let leftChains = [], rightChains = [];
    let lowest = 0, highest = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i].y < points[lowest].y) lowest = i;
        if (points[i].y > points[highest].y) highest = i;
    }
    console.log(points);
    console.log(lowest);
    console.log(highest);
    for (let i = lowest; i !== highest; i = (i+1) % points.length) {
        points[i].position = "right";
        rightChains.push(points[i]);
    }
    for (let i = highest; i !== lowest; i = (i+1) % points.length) {
        points[i].position = "left";
        leftChains.push(points[i]);
    }
    leftChains = leftChains.reverse();

    // TODO merge left and right chains by y-axis
    // points.sort((a, b) => a.y - b.y);

    let mergedChains = [];
    let indexLeft = 0, indexRight = 0;
    while (indexLeft < leftChains.length && indexRight < rightChains.length) {
        if (leftChains[indexLeft].y < rightChains[indexRight].y) {
            mergedChains.push(leftChains[indexLeft++]);
        } else {
            mergedChains.push(rightChains[indexRight++]);
        }
    }

    if (indexRight < rightChains.length) {
        mergedChains = mergedChains.concat(rightChains.slice(indexRight));
    } else {
        mergedChains = mergedChains.concat(leftChains.slice(indexLeft));
    }
    points = mergedChains;

    let stack = [];
    stack.push(points[0]);
    stack.push(points[1]);
    events.push(generateEvent(output, "Init", points[1], stack));
    for (let i=2; i<points.length; i++) {
        let c = points[i], t = stack[stack.length-1], s = stack[stack.length-2], b = stack[0];
        if (c.position === t.position) { // Case A: c lies on the same chain as t
            if (isReflex(s, t, c)) { // t is reflex
                stack.push(c);
                events.push(generateEvent(points, 'Case A1: Same Side + Reflex', c, stack));
            } else { // t is convex
                while (true) {
                    let s = stack[stack.length-2],
                        t = stack[stack.length-1];
                    output.push(CCW(s, t, c));
                    stack.pop();
                    events.push(generateEvent(output, "Case A2: Same Side + Convex (chop triangle)", c, stack));
                    s = stack[stack.length-2];
                    t = stack[stack.length-1];
                    if (stack.length === 1 || isReflex(s, t, c)) {
                        break;
                    }
                }
                stack.push(c);
                events.push(generateEvent(output, "Case A2: Same Side + Convex (reinit stack)", c, stack));
            }
        } else { // Case B: c lies on the opposite chain of t
            let top = t;
            while (stack.length > 1) {
                let s = stack[stack.length-2],
                    t = stack[stack.length-1];
                output.push(CCW(s, t, c));
                stack.pop();
                events.push(generateEvent(output, "Case B: Opposite Side (chop triangle)", c, stack));
            }
            stack.pop();
            stack.push(top);
            stack.push(c);
            events.push(generateEvent(output, "Case B: Opposite Side (reinit stack)", c, stack));
        }
    }
    return [output, events];
}

// let [answer, events] = MonotoneDecomp(points);
//
// console.log(events);
//
// answer.forEach(each => {
//     let t = new Trapezoid();
//     t.chain = each;
//     t.draw(ctx);
//
//     let [triangulations, events] = TriangulatingMonotonePolygon(each);
//     console.log(triangulations, events);
//     triangulations.forEach(each => {
//         drawPoly(ctx, each, 'blue');
//     });
//     // console.log(events);
// });
