import Utils from './Utils.js';
import Model from './Model.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Player extends Model {

    constructor(mesh, texture, options) {
        super(mesh, texture, options);
        Utils.init(this, this.constructor.defaults, options);
        
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.jumping = false;
        this.landed = false;
    }

    update(dt, elapsed) {
        const p = this;
        const speed = Math.min(Math.max(elapsed*Math.min(p.maxSpeed/240, 1), p.minSpeed), p.maxSpeed);

        const forward = vec3.set(vec3.create(),
            0,0,-1);
        const right = vec3.set(vec3.create(),1,0,0);
        
        vec3.scale(right, right, p.strafeSpeed)
        // 1: add movement acceleration
        let acc = vec3.create();
        
        vec3.add(acc, acc, forward);

        


        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['Space'] && this.landed) {
            this.jumping = true;
            this.landed = false;
            this.jumpTimer = 0;
            setTimeout(()=>{
                this.jumping = false;
                this.jumpTimer = 0;
            }, 135); //
        }
        if(this.jumping){
            this.jumpTimer += dt*1000;
            console.log(this.jumpTimer);
            this.rotation[0] = (Math.min(this.jumpTimer/135, 1))*2*Math.PI;
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
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
    maxSpeed         : 15,
    strafeSpeed: 5,
    minSpeed         : 4.5,
    friction         : 0.2,
    acceleration     : 20
};
