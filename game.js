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
        this.sceneLength = 13;
        this.tileLength = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        await this.load('scene.json');
        this.cube = this.scene.nodes[1];
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene('scene.json');
        const builder = new SceneBuilder(scene);

        this.builder = builder;
        this.scene = builder.build();
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
        const cubeJSON = {
            "type": "model",
            "mesh": 0,
            "texture": 1,
            "aabb": {
              "min": [-1, -0.05, -1],
              "max": [1, 0.05, 1]
            },
            "translation": [0, 0, 1]
        };
        const cube = this.builder.createNode(cubeJSON);
        this.camera.addChild(cube);

        this.scene.addNode(cube);

        

        this.renderer.prepare(this.scene)
        
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
        const cube = this.builder.createNode(cubeJSON);

        

        const {sceneLength, tileLength} = this;
        cube.translation = [0, 0, - sceneLength - tileLength ];
        cube.updateTransform();
        this.sceneLength += tileLength;
        this.scene.addNode(cube);
        console.log(cube, this.scene);
        this.renderer.prepare(this.scene);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new dat.GUI();
    gui.add(app, 'enableCamera');

    setInterval(()=>{
        app.addNewItems();
    }, 3000);
});
