import Node from './Node.js';

export default class Light extends Node {

    constructor(options) {
        super(options);

        Object.assign(this, {
            ambient          : 1,
            diffuse          : 1,
            specular         : 1,
            shininess        : 1,
            color            : [220, 220, 245],
            attenuatuion     : [1.0, 0, 0.001]
        });
    }

}