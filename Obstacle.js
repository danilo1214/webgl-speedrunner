import Model from './Model.js';

export default class Obstacle extends Model {

    constructor(mesh, image, options) {
        super(mesh,image,options);
    }

    update(dt) {
        this.rotation[1] += dt;
        this.updateTransform();
    }

}
