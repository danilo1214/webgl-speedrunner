import Mesh from './Mesh.js';

import Node from './Node.js';
import Model from './Model.js';
import Obstacle from './Obstacle.js';
import Camera from './Camera.js';

import Scene from './Scene.js';
import Player from './Player.js';
import Powerup from './Powerup.js';
import Light from './Light.js';

export default class SceneBuilder {

    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec) {
        const mesh = new Mesh(this.spec.meshes[spec.mesh]);
        const texture = this.spec.textures[spec.texture];
        switch (spec.type) {
            case 'light':  return new Light(spec);
            case 'camera':  return new Camera(spec);
            case 'player':  return new Player(mesh, texture, spec);
            case 'obstacle':  return new Obstacle(mesh, texture, spec);
            case 'powerup':  return new Powerup(mesh, texture, spec);
            case 'model' :  return new Model(mesh, texture, spec);
            
            default: return new Node(spec);
        }
    }

    build() {
        let scene = new Scene();
        this.spec.nodes.forEach(spec => scene.addNode(this.createNode(spec)));
        return scene;
    }

}
