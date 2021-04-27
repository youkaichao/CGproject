width = 1000;
height = 1000;
center = 500;

function drawPoly(ctx, points) {
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

// 构造多边形
let points = [];
const N = 10;

for(let i = 0; i < N; ++i)
{
    let point = {};
    point.angle = Math.random() * 2 * Math.PI;
    point.radius = Math.random() * 200 + 100;
    point.x = center + point.radius * Math.cos(point.angle);
    point.y = center + point.radius * Math.sin(point.angle);
    points.push(point);
}
points.sort((a, b) => a.angle - b.angle);

// 画多边形
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';

// 顶点文字
for(let i = 0; i < N; ++i)
{
    ctx.strokeText(`[${i}]`, points[i].x + 5, points[i].y - 5);
    points[i] = {'x': points[i].x, 'y': points[i].y, 'i': i};
}

drawPoly(ctx, points);

// 顶点方块
ctx.fillStyle = 'blue';
ctx.fillRect(500-2.5, 500-2.5, 5, 5);
for(let i = 0; i < N; ++i)
{
    ctx.fillRect(points[i].x - 2.5, points[i].y - 2.5, 5, 5);
}

// 算法代码正式开始,返回1代表左边，是在屏幕坐标系下，但是以人的感觉的左边
function toLeft(start, end, point)
{
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


function point_equal(a, b) {
    return a.x === b.x && a.y === b.y;
}


function negateP(p) {
    return {'x': - p.x, 'y': -p.y, 'i': p.i};
}


class Trapezoid {
    constructor(vertex=null, prev=null, next=null) {
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
        this.helper = t1.tail;
        this.chain = t1.chain.concat(t2.chain.slice(1));
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
    // 按照y坐标升序排列，屏幕方向从上到下
    let indices = [...Array(points.length).keys()];
    indices.sort((a, b) => points[a].y - points[b].y);

    let sweepline = []; // 扫描线，用于存放四边形
    let output = []; // 存放切出来的多边形
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
        }
        else if(in_ts.length === 1)
        {
            let [t, t_index] = in_ts[0];
            if(point_equal(p, t.head) && point_equal(p, t.tail))
            {// 四边形封闭了
                sweepline.splice(t_index, 1);
                t.chain.splice(0, 1);
                output.push(t);
            }
            else if(point_equal(p, t.head))
            {// 是左边的虚顶点
                t.helper = p;
                t.chain.splice(0, 0, (prev.y > next.y ? prev : next));
            }
            else if(point_equal(p, t.tail))
            {// 是右边的虚顶点
                t.helper = p;
                t.chain.push(prev.y > next.y ? prev : next);
            }else{
                // 在四边形内部，该split了
                let [t1, t2] = t.split(p, next, prev);
                sweepline.splice(t_index, 1, t1, t2);
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
        }
    }
    return output;
}

function MonotoneDecomp(points) {
    let output = onePass(points);
    let answer = [];
    output.forEach(t1 => {
        onePass(t1.chain.map(negateP)).forEach(t2 => {
            answer.push(t2.chain.map(negateP));
        });
    });
    return answer;
}

let answer = MonotoneDecomp(points);

answer.forEach(each => {
    let t = new Trapezoid();
    t.chain = each;
    t.draw(ctx);
});
