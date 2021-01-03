import Application from './common/Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import Model from './Model.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
import Obstacle from './Obstacle.js';
import Powerup from './Powerup.js';
import Player from './Player.js';

class App extends Application {



    async start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.score = 0;
        this.gameOver = false;
        this.maxHealth = 5;
        this.health = this.maxHealth;
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
            "translation": [0, 5,-1]
          };

        this.obstacleJSON = {
            "type": "obstacle",
            "mesh": 3,
            "texture": 4,
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

        this.lightJSON = {
            "type": "light",
            //"rotation": [0,0,0],
            //"translation": [0, -200,0]
        }
    }
    
    setScoreElement(score){
        this.scoreEl = score;
    }

    setHealthElement(health){
        this.healthEl = health;
        this.healthEl.innerHTML = `${this.health}HP`;
    }

    async load(uri) {

        const scene = await new SceneLoader().loadScene('scene.json');
        
        const builder = new SceneBuilder(scene);

        this.builder = builder;
        this.scene = builder.build();
        this.player = builder.createNode(this.playerJSON);
        this.light = builder.createNode(this.lightJSON);

        this.scene.addNode(this.player);


        

        this.physics = new Physics(this.scene, this);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });
        this.player.addChild(this.camera);
        this.player.addChild(this.light)

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
    
    damageHealth(){
        this.health -= 1;

        this.healthEl.style.width = `${Math.round((this.health/this.maxHealth)*100)}px`;
        this.healthEl.innerHTML = `${this.health}HP`;
        if(this.health == 0){
            this.gameOver = true;
        }
    }

    update() {
        if(this.gameOver){
            return;
        }
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
        if(this.gameOver) return;
        if (this.scene) {
            this.renderer.render(this.scene, this.camera, this.light, this.player);
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

    deletePassed(){
        let {scene} = this;
        const toDelete = [];

        for(let i = 0; i < scene.nodes.length; i++){
            const node = scene.nodes[i];
            if(node instanceof Powerup || (node instanceof Model && !( node instanceof Player) && !(node instanceof Camera)) || node instanceof Obstacle){
                
                const transform = node.getGlobalTransform();
                const playerTransform = this.player.getGlobalTransform();
                const zp = playerTransform[14];
                const zt = transform[14];

                if(Math.abs(zp - zt) >= this.tileLength && zp < zt){
                    toDelete.push(i);
                }

            }
        }

        for (let i = toDelete.length -1; i >= 0; i--){
            this.scene.nodes.splice(toDelete[i], 1);
        }
    
    }

    addNewItems(){

        this.deletePassed();

        const {roadJSON, cubeWallJSON, obstacleJSON, powerUpJSON, sceneLength, tileLength} = this;

        const road = this.builder.createNode(roadJSON);

        

        road.translation = [0, 0, - sceneLength - tileLength ];
        road.updateTransform();
        this.scene.addNode(road);

        const road1 = this.builder.createNode(roadJSON);
        road1.translation = [4, 0, - sceneLength - tileLength ];
        road1.updateTransform();
        this.scene.addNode(road1);

        this.sceneLength += tileLength;

        const wall = this.builder.createNode(cubeWallJSON);
        wall.translation = [7, 0, - sceneLength - tileLength ];
        wall.updateTransform();
        this.scene.addNode(wall);

        const wall1 = this.builder.createNode(cubeWallJSON);
        wall1.translation = [-3, 0, - sceneLength - tileLength ];
        wall1.updateTransform();
        this.scene.addNode(wall1);

        const obstacle = this.builder.createNode(obstacleJSON);
        obstacle.translation = [Math.random()*8 -1,1+ Math.random()*4, -sceneLength - tileLength - Math.random()*tileLength -1];
        obstacle.updateTransform();
        this.scene.addNode(obstacle);

        const powerup = this.builder.createNode(powerUpJSON);
        powerup.translation = [Math.random()*8, 1 + Math.random()*4, -sceneLength - tileLength - Math.random()*tileLength];
        powerup.updateTransform();
        this.scene.addNode(powerup);
        this.renderer.prepareNodes([obstacle, powerup, wall, wall1, road, road1]);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const score = document.getElementById('#score');
    const health = document.getElementById('health');


    const app = new App(canvas);
    app.setScoreElement(score);
    app.setHealthElement(health)

    const gui = new dat.GUI();
    
});
