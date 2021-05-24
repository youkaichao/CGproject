let input = new Input();
let monoPlay = new MonoPlay();
let Tri = new TriPlay();

input.connectMonoPlay(monoPlay);
monoPlay.connectInputview(input);
monoPlay.connectTriView(Tri);