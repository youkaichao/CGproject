let input = new Input();
let monoPlay = new MonoPlay();
let Tri = new TriPlay();
let fiskPlay = new FiskPlay();

input.connectMonoPlay(monoPlay);
monoPlay.connectInputview(input);
monoPlay.connectTriView(Tri);
Tri.connectFiskView(fiskPlay);
fiskPlay.connectTriangulationView(Tri);