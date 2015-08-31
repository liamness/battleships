import constants from './constants';

export default (function() {
    'use strict';

    // constructor
    function Ship(elem, size, pos, valid, visible) {
        this.elem = elem;
        this.size = size;
        this.pos = pos || [-1, -1];
        this.valid = valid || false;
        this.visible = visible || false;
        this.hits = 0;
        this.sunk = false;
    }

    // private methods
    function draw () {
        /* jshint validthis:true */
        
        this.elem.style.width = this.size[0] * constants.gridSpacing + 'px';
        this.elem.style.height = this.size[1] * constants.gridSpacing + 'px';
        this.elem.style.left = this.pos[0] * constants.gridSpacing + 'px';
        this.elem.style.top = this.pos[1] * constants.gridSpacing + 'px';
    }

    function checkNotIntersecting(otherShip) {
        /* jshint validthis:true */

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

    // public methods
    Ship.prototype.setVisible = function(visible) {
        if(visible) {
            this.elem.classList.remove('hide');
        } else {
            this.elem.classList.add('hide');
        }

        this.visible = visible;
    };

    Ship.prototype.setValid = function(valid) {
        if(valid) {
            this.elem.classList.remove('grid__ship--highlight');
        } else {
            this.elem.classList.add('grid__ship--highlight');
        }

        this.valid = valid;
    };

    Ship.prototype.move = function(position) {
        var x = position[0], y = position[1];

        if(x < 0) { x = 0; }
        else if(x > constants.gridSize - this.size[0]) { x = constants.gridSize - this.size[0]; }

        if(y < 0) { y = 0; }
        else if(y > constants.gridSize - this.size[1]) { y = constants.gridSize - this.size[1]; }

        if(x !== this.pos[0] || y !== this.pos[1]) {
            this.pos = [x, y];
            requestAnimationFrame(draw.bind(this));
        }
    };

    Ship.prototype.rotate = function(position) {
        var diffX = Math.round((this.size[0] + this.size[1]) / 2) - 1,
            newPosition = [
                this.pos[0] + (this.size[0] > this.size[1] ? diffX : - diffX),
                this.pos[1] + Math.round((this.size[1] - this.size[0]) / 2)
            ];

        this.size = [this.size[1], this.size[0]];
        this.move(newPosition);
    };

    Ship.prototype.getExtents = function() {
        return {
            minX: this.pos[0],
            maxX: this.pos[0] + this.size[0],
            minY: this.pos[1],
            maxY: this.pos[1] + this.size[1],
        };
    };

    Ship.prototype.checkHit = function(shot) {
        if(this.sunk) { return false; }

        if(
            (shot.pos[0] >= this.pos[0] && shot.pos[0] < this.pos[0] + this.size[0]) &&
            (shot.pos[1] >= this.pos[1] && shot.pos[1] < this.pos[1] + this.size[1])
        ) {
            if(++this.hits === this.size[0] * this.size[1]) {
                this.sunk = true;
                this.elem.classList.add('grid__ship--highlight');

                if(!this.visible) { this.setVisible(true); }
            }

            return true;
        } else {
            return false;
        }
    };

    Ship.prototype.checkNotIntersecting = function(ships) {
        var self = this;

        return ships.every(function(otherShip) {
            return checkNotIntersecting.call(self, otherShip);
        });
    };

    return Ship;
})();