let input = new Input();
let monoPlay = new MonoPlay();
let Tri = new TriPlay();
let fiskPlay = new FiskPlay();

input.connectMonoPlay(monoPlay);
monoPlay.connectInputview(input);
monoPlay.connectTriView(Tri);
Tri.connectFiskView(fiskPlay);
fiskPlay.connectTriangulationView(Tri);

// set introduction
function intro() {
    introJs().setOptions({
        disableInteraction: true,
        tooltipClass: 'customTooltip',
        steps: [{
          title: '欢迎！',
          intro: '欢迎使用“多边形三染色”算法演示系统！'
        }, {
          element: document.querySelector('#controlrow'),
          intro: '在这里，你可以输入任意的简单多边形，并控制算法的演示流程'
        },{
          title: '算法流程',
          intro: '整个流程分为4步：<br/>1.输入多边形；<br/>2.将简单多边形分解为单调多边形；<br/>3.选择单调多边形，将其进行三角剖分；<br/>4.对简单多边形进行三染色'
        }, {
          element: document.querySelector('#input-block'),
            title: '第一步-输入多边形',
          intro: '你有多种方式来输入多边形：<br/>1.拖动选择器并点击生成按钮来随机生成指定顶点数的多边形；<br/>2.上传json格式的多边形；<br/>3.你也可以直接在画布上进行点击或者拖动来生成多边形。<br/>' +
              '如果你想保留你绘制的多边形，可以点击下载按钮进行下载。<br/>我们不提供撤销/反撤销操作，如果你对结果不满意，可以点击清空按钮，这会清空画板上的所有图形'
        }, {
            title: '第二步-简单多边形分解',
          element: document.querySelector('#monocomp'),
          intro: '生成好你的多边形之后，你可以使用这组按钮来查看<b>简单多边形分解为单调多边形</b>的过程，这四个按钮的功能分别为：返回算法第一步、返回算法前一步、进入算法下一步和跳转到算法最后一步'
        },{
            title: '第三步-三角剖分',
          element: document.querySelector('#triangulation'),
          intro: '接下来你可以选择一个单调多边形，并用这组按钮来查看<b>三角剖分</b>过程'
        },{
            title: '第四步-三染色',
          element: document.querySelector('#fisk'),
          intro: '最后，你可以用这组按钮来对整个简单多边形进行<b>三染色</b>'
        },{
          element: document.querySelector('#input-block'),
          intro: '你也可以随时回到这里，清空画板并重新输入一个多边形'
        },
        {
          intro: '教程结束了！请尽情使用我们的系统！！！'
        }]
    }).start();
}
$("#intro-btn").click(function () {
    intro()
});