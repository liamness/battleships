import constants from './constants';

// constants
const hideClass = 'grid__ship--hide';
const highlightClass = 'grid__ship--highlight';

// private methods
function draw () {
    this.elem.style.width = this.size[0] * constants.gridSpacing + 'px';
    this.elem.style.height = this.size[1] * constants.gridSpacing + 'px';
    this.elem.style.left = this.pos[0] * constants.gridSpacing + 'px';
    this.elem.style.top = this.pos[1] * constants.gridSpacing + 'px';
}

function checkNotIntersecting(otherShip) {
    // find extents
    var shipOneExtents = this.getExtents(),
        shipTwoExtents = otherShip.getExtents();

    return !(
        shipOneExtents.minX < shipTwoExtents.maxX &&
        shipOneExtents.maxX > shipTwoExtents.minX &&
        shipOneExtents.minY < shipTwoExtents.maxY &&
        shipOneExtents.maxY > shipTwoExtents.minY
    );
}

export default class {
    constructor(elem, size, pos) {
        this.elem = elem;
        this.size = size;
        this.pos = pos || [-1, -1];
        this.highlight = false;
        this.visible = false;
        this.hits = 0;
        this.sunk = false;
    }

    setVisible(visible) {
        if(visible) {
            this.elem.classList.remove(hideClass);
        } else {
            this.elem.classList.add(hideClass);
        }

        this.visible = visible;
    }

    setHighlight(highlight) {
        if(highlight) {
            this.elem.classList.add(highlightClass);
        } else {
            this.elem.classList.remove(highlightClass);
        }

        this.highlight = highlight;
    }

    move(position) {
        var x = position[0], y = position[1];

        if(x < 0) { x = 0; }
        else if(x > constants.gridSize - this.size[0]) { x = constants.gridSize - this.size[0]; }

        if(y < 0) { y = 0; }
        else if(y > constants.gridSize - this.size[1]) { y = constants.gridSize - this.size[1]; }

        if(x !== this.pos[0] || y !== this.pos[1]) {
            this.pos = [x, y];
            requestAnimationFrame(draw.bind(this));
        }
    }

    rotate() {
        var diffX = Math.round((this.size[0] + this.size[1]) / 2) - 1,
            newPosition = [
                this.pos[0] + (this.size[0] > this.size[1] ? diffX : - diffX),
                this.pos[1] + Math.round((this.size[1] - this.size[0]) / 2)
            ];

        this.size = [this.size[1], this.size[0]];
        this.move(newPosition);
    }

    getExtents() {
        return {
            minX: this.pos[0],
            maxX: this.pos[0] + this.size[0],
            minY: this.pos[1],
            maxY: this.pos[1] + this.size[1]
        };
    }

    checkHit(shot) {
        if(this.sunk) { return false; }

        if(
            (shot.pos[0] >= this.pos[0] && shot.pos[0] < this.pos[0] + this.size[0]) &&
            (shot.pos[1] >= this.pos[1] && shot.pos[1] < this.pos[1] + this.size[1])
        ) {
            if(++this.hits === this.size[0] * this.size[1]) {
                this.sunk = true;
                this.setHighlight(true);

                if(!this.visible) { this.setVisible(true); }
            }

            return true;
        } else {
            return false;
        }
    }

    checkNotIntersecting(ships) {
        return ships.every((otherShip) => checkNotIntersecting.call(this, otherShip));
    }
}
