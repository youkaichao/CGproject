class Vertex {
    constructor(id, point) {
        this.id = id;
        this.point = point;
        this.outEdges = []; // outgoing HalfEdges
    }
}


class HalfEdge {
    constructor(src, tgt) {
        this.src = src; // source Vertex
        this.tgt = tgt; // target Vertex
        this.twin = null; // twin HalfEdge
        this.face = null; // incident Face
    }
}

class Face {
    constructor(id) {
        this.id = id;
        this.incidentEdges = []; // incident HalfEdges
    }

    // all the verices on this face
    vertices() {
        let vs = [];
        this.incidentEdges.forEach((e, i) => {
            vs.push(e.src);
        });
        return vs;
    }

    // all the incident faces
    incidentFaces() {
        let faces = [];
        this.incidentEdges.forEach((e, i) => {
            if (e.twin.face !== null) {
                faces.push(e.twin.face);
            }
        });
        return faces;
    }

    debug() {
        let vs = [];
        this.vertices().forEach((v, i) => {
           vs.push(v.id);
        });
    }
}

class DCEL {
    constructor() {
        this.edges = [];
        this.faces = [];
        this.vertices = [];
    }

    createVertex(point) {
        this.vertices.push(new Vertex(this.vertices.length, point));
    }

    // create Edge between Vertex va and Vertex vb if this Edge doesn't exist
    createEdge(va, vb) {
        let eab = this.getHalfEdge(va, vb);
        if (eab !== null) {
            return eab;
        }
        let left = new HalfEdge(va, vb), right = new HalfEdge(vb, va);
        left.twin = right; right.twin = left;
        va.outEdges.push(left);
        vb.outEdges.push(right);
        this.edges.push(left); this.edges.push(right);
        return left;
    }

    createFace(halfEdges) {
        let face = new Face(this.faces.length);
        halfEdges.forEach((e, i) => {
            face.incidentEdges.push(e);
            e.face = face;
        });
        this.faces.push(face);
        return face;
    }

    // get HalfEdge from Vertex va to Vertex vb
    // return null if this Edge doesn't exist
    getHalfEdge(va, vb) {
        let edge = null;
        va.outEdges.forEach((e, i) => {
            if (e.tgt === vb) {
                edge = e;
            }
        });
        return edge;
    }
    
}

function getGraph(triangles) {
    // make DCEL
    let dcel = new DCEL();
    let points = {};
    for(let triangle of triangles) {
        for(let point of triangle) {
            points[point.id] = point;
        }
    }

    for (let point in Object.values(points)){
        dcel.createVertex(point);
    }

    for (let i=0; i<triangles.length; i++) {
        let [pa, pb, pc] = triangles[i];
        let va = dcel.vertices[pa.id], vb = dcel.vertices[pb.id], vc = dcel.vertices[pc.id];
        let eab = dcel.createEdge(va, vb), ebc = dcel.createEdge(vb, vc), eca = dcel.createEdge(vc, va);
        dcel.createFace([eab, ebc, eca]);
    }

    // get graph
    let graph = {};
    dcel.faces.forEach((face, i) => {
        graph[face.id] = [];
        // get the id of all incident faces
        face.incidentFaces().forEach((f, i) => {
           graph[face.id].push(f.id);
        });
    });

    // only for debug
    dcel.faces.forEach((face, i) => {
        face.debug();
        face.incidentFaces().forEach((f, i)=>{
            f.debug();
        });
    });
    return graph;
}



// example of usage
let points = [{'x': 1, 'y': 2, 'id': 0}, {'id':1}, {'id':2},{'id':3},{'id':4},{'id':5},{'id':6},];
let triangles = [[points[0], points[1], points[2]], [points[1], points[3], points[2]], [points[1], points[4], points[3]], [points[4], points[6], points[3]], [points[4], points[5], points[6]]];

let graph = getGraph(triangles);
