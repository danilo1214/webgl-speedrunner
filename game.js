import Application from './common/Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import Model from './Model.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
import Obstacle from './Obstacle.js';
import Powerup from './Powerup.js';

class App extends Application {



    async start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.score = 0;
        this.time = Date.now();
        this.initTime = Date.now();
        this.startTime = this.time;
        this.aspect = 1;
        this.sceneLength = 5;
        this.tileLength = 12;

        await this.initModels();
        await this.load('scene.json');
        this.player.enable();
    }

    initModels(){
        this.roadJSON = {
            "type": "model",
            "mesh": 0,
            "texture": 2,
            "aabb": {
              "min": [-2, -0.05, -6],
              "max": [2, 0.05, 6]
            },
            "translation": [0, 0, -12]
        };

        this.cubeWallJSON = {
            "type": "model",
            "mesh": 2,
            "texture": 0,
            "aabb": {
              "min": [-1, -3, -6],
              "max": [1, 3, 6]
            },
            "translation": [0, 0, -12]
        };

        this.playerJSON = {
            "type": "player",
            "mesh": 3,
            "texture": 1,
            "rotation": [0, 0, 0],
            "aabb": {
                "min": [-1, -1, -1],
                "max": [1, 1, 1]
            },
            "translation": [0, 3,-1]
          };

        this.obstacleJSON = {
            "type": "obstacle",
            "mesh": 3,
            "texture": 0,
            "rotation": [0,0,0],
            "aabb": {
                "min": [-1, -1, -1],
                "max": [1, 1, 1]
              },
            "translation": [0, 0,-3]
        }

        this.powerUpJSON = {
            "type": "powerup",
            "mesh": 3,
            "texture": 3,
            "rotation": [0,0,0],
            "aabb": {
                "min": [-1, -1, -1],
                "max": [1, 1, 1]
              },
            "translation": [0, 0,-15]
        }
    }
    
    setScoreElement(score){
        this.scoreEl = score;
    }

    async load(uri) {

        const scene = await new SceneLoader().loadScene('scene.json');
        
        const builder = new SceneBuilder(scene);

        this.builder = builder;
        this.scene = builder.build();
        this.player = builder.createNode(this.playerJSON);
        this.obstacle = builder.createNode(this.obstacleJSON);
        this.powerup = builder.createNode(this.powerUpJSON);

        this.scene.addNode(this.player);
        this.scene.addNode(this.obstacle);
        this.scene.addNode(this.powerup);


        

        this.physics = new Physics(this.scene, this);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });
        this.player.addChild(this.camera);

        this.camera.aspect = this.aspect;

        this.camera.updateProjection();
        

        setInterval(()=>{
            this.addNewItems();
        }, 1000);

        this.renderer.prepare(this.scene);        
    }

    addPoints(val){
        this.score += val;
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.score += dt;
        const elapsed = (this.time - this.initTime) * 0.001;
        this.startTime = this.time;

        if (this.player) {
            this.player.update(dt, elapsed);
        }

        if (this.physics) {
            this.physics.update(dt);

            this.physics.gravity(dt, this.player);
        }

        if(this.scene){
            this.scene.traverse(node=>{
                if(node instanceof Obstacle || node instanceof Powerup){
                    node.update(dt);
                }
            })
        }
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
        if(this.scoreEl){
            this.scoreEl.innerHTML = this.score.toFixed(0);
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
        
        const {roadJSON, cubeWallJSON, obstacleJSON, powerUpJSON} = this;
        let road = this.builder.createNode(roadJSON);

        

        const {sceneLength, tileLength} = this;
        road.translation = [0, 0, - sceneLength - tileLength ];
        road.updateTransform();
        this.scene.addNode(road);

        road = this.builder.createNode(roadJSON);
        road.translation = [4, 0, - sceneLength - tileLength ];
        road.updateTransform();
        this.scene.addNode(road);

        this.sceneLength += tileLength;

        let wall = this.builder.createNode(cubeWallJSON);
        wall.translation = [7, 0, - sceneLength - tileLength ];
        wall.updateTransform();
        this.scene.addNode(wall);

        wall = this.builder.createNode(cubeWallJSON);
        wall.translation = [-3, 0, - sceneLength - tileLength ];
        wall.updateTransform();
        this.scene.addNode(wall);

        const obstacle = this.builder.createNode(obstacleJSON);
        obstacle.translation = [Math.random()*8, Math.random()*2, -sceneLength - tileLength - Math.random()*tileLength];
        obstacle.updateTransform();
        this.scene.addNode(obstacle);

        const powerup = this.builder.createNode(powerUpJSON);
        powerup.translation = [Math.random()*8, Math.random()*2, -sceneLength - tileLength - Math.random()*tileLength];
        powerup.updateTransform();
        this.scene.addNode(powerup);
        this.renderer.prepare(this.scene);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const score = document.getElementById('#score');


    const app = new App(canvas);
    app.setScoreElement(score);

    const gui = new dat.GUI();
    
});
