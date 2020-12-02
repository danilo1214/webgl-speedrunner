import Application from './common/Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import Model from './Model.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';

class App extends Application {

    async start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.initTime = Date.now();
        this.startTime = this.time;
        this.aspect = 1;
        this.sceneLength = 5;
        this.tileLength = 2;
        this.playerJSON = {
            "type": "model",
            "mesh": 1,
            "texture": 1,
            "rotation": [0.5, 0, 0],
            "aabb": {
              "min": [-1, -0.05, -1],
              "max": [1, 0.05, 1]
            },
            "scale": [1, 1, 1],
            "translation": [0, 1, -5]
          };

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        await this.load('scene.json');
        this.cube = this.scene.nodes[2];
    }

    async load(uri) {

        const scene = await new SceneLoader().loadScene('scene.json');
        
        const builder = new SceneBuilder(scene);

        this.builder = builder;
        this.scene = builder.build();
        this.player = builder.createNode(this.playerJSON);
        

        this.physics = new Physics(this.scene);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        
        this.camera.addChild(this.player);

        setInterval(()=>{
            this.addNewItems();
        }, 1000);

        this.renderer.prepare(this.scene);
        console.log(this.scene);
        
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
        } else {
            this.camera.disable();
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        const elapsed = (this.time - this.initTime) * 0.001;
        this.startTime = this.time;

        if (this.camera) {
            this.camera.update(dt, elapsed);
        }

        if (this.physics) {
            this.physics.update(dt);
        }
    }

    render() {
        console.log(this.scene);
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

    addNewItems(){
        
        const cubeJSON = {
            "type": "model",
            "mesh": 0,
            "texture": 0,
            "aabb": {
              "min": [-1, -0.05, -1],
              "max": [1, 0.05, 1]
            },
            "translation": [0, 0, -12]
        };
        let cube = this.builder.createNode(cubeJSON);

        

        const {sceneLength, tileLength} = this;
        cube.translation = [0, 0, - sceneLength - tileLength ];
        cube.updateTransform();
        this.scene.addNode(cube);

        cube = this.builder.createNode(cubeJSON);
        cube.translation = [2, 0, - sceneLength - tileLength ];
        cube.updateTransform();
        this.scene.addNode(cube);

        cube = this.builder.createNode(cubeJSON);
        cube.translation = [4, 0, - sceneLength - tileLength ];
        cube.updateTransform();
        this.scene.addNode(cube);
        this.sceneLength += tileLength;

        this.renderer.prepare(this.scene);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new dat.GUI();
    gui.add(app, 'enableCamera');

    
});
