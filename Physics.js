import Camera from "./Camera.js";
import Light from "./Light.js";
import Obstacle from "./Obstacle.js";
import Player from "./Player.js";
import Powerup from "./Powerup.js";

const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;

export default class Physics {

    constructor(scene, app) {
        this.scene = scene;
        this.app = app;
    }

    update(dt) {
        this.scene.traverse(node => {
            if (node.velocity) {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateTransform();
                this.scene.traverse(other => {
                    if (node !== other) {
                        this.resolveCollision(node, other);
                    }
                });
            }
        });

    }

    gravity(dt, player){
        const {jumping} = player;
        vec3.scaleAndAdd(player.velocity, player.velocity,[0,jumping? 130: -30, 0], dt>0.3? 0.3 : dt);
        player.updateTransform();
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        if (!isColliding || a instanceof Camera || a instanceof Light || b instanceof Light || b instanceof Camera) {
            return;
        }

        if(a instanceof Player && b instanceof Obstacle){
            const index = this.scene.nodes.indexOf(b);
            this.scene.nodes.splice(index, 1);
            this.app.damageHealth();
            return;
        }

        if(a instanceof Player && b instanceof Powerup){
            const index = this.scene.nodes.indexOf(b);
            this.scene.nodes.splice(index, 1);
            this.app.addPoints(25);
            return;
        }

        if(a instanceof Player && !a.jumping && this.intervalIntersection(mina[1], maxa[1], minb[1], maxb[1])){
            a.velocity[1] = 0;
            a.landed = true;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), maxb, mina);
        const diffb = vec3.sub(vec3.create(), maxa, minb);

        // console.log("collision", a, b);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);
        a.updateTransform();
    }

}
