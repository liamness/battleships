import constants from './constants';

// dom elements
const opponentGrid = document.getElementsByClassName('grid--opponent')[0];

// constants
const hideClass = 'grid__crosshair--hide';

// private methods
function draw() {
    this.elem.style.left = this.pos[0] * constants.gridSpacing + 'px';
    this.elem.style.top = this.pos[1] * constants.gridSpacing + 'px';
}

export default class {
    constructor() {
        this.elem = opponentGrid.getElementsByClassName('grid__crosshair')[0];
        this.pos = [-1, -1];
        this.visible = false;
    }

    setVisible(visible) {
        if(visible) {
            this.elem.classList.remove(hideClass);
        } else {
            this.elem.classList.add(hideClass);
        }

        this.visible = visible;
    }

    move(position) {
        if(position[0] !== this.pos[0] || position[1] !== this.pos[1]) {
            this.pos = position;
            requestAnimationFrame(draw.bind(this));
        }
    }
}
