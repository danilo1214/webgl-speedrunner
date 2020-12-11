import Utils from './Utils.js';
import Model from './Model.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Player extends Model {

    constructor(mesh, texture, options) {
        super(mesh, texture, options);
        console.log(this);
        Utils.init(this, this.constructor.defaults, options);
        
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
    }

    update(dt, elapsed) {
        const p = this;

        const forward = vec3.set(vec3.create(),
            0,0,-1);
        const right = vec3.set(vec3.create(),1,0,0);
        

        // 1: add movement acceleration
        let acc = vec3.create();
        
        vec3.add(acc, acc, forward);

        

        vec3.scale(right,right,3*p.maxSpeed);

        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        const speed = Math.min(elapsed*p.maxSpeed/360, p.maxSpeed);
        vec3.scale(acc, acc, (dt> 0.7 ? 0.7 : dt) * speed );
        vec3.add(p.translation, p.translation, acc);

        

        //vec3.scale(p.velocity, p.velocity, 1 - p.friction);

        // 3: if no movement, apply friction
        /*if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }*/

        // 4: limit speed

        //const len = vec3.len(p.velocity);
        /*
        if (len > p.maxSpeed) {
            vec3.scale(p.velocity, p.velocity, p.maxSpeed / len);
        }
        */
    }

    enable() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

Player.defaults = {
    velocity         : [0, 0, 0],
    maxSpeed         : 5,
    minSpeed         : 1,
    friction         : 0.2,
    acceleration     : 20
};
