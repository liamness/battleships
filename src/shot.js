import constants from './constants';

export default (function() {
    'use strict';

    // dom elements
    var opponentGrid = document.getElementsByClassName('grid--opponent')[0],
        opponentShotsElem = opponentGrid.getElementsByClassName('grid__shots')[0],
        playerGrid = document.getElementsByClassName('grid--player')[0],
        playerShotsElem = playerGrid.getElementsByClassName('grid__shots')[0];

    // constructor
    function Shot(player) {
        this.elem = document.createElement('div');
        this.elem.className = 'grid__shot hide';

        if(player === 'opponent') {
            playerShotsElem.appendChild(this.elem);
        } else if(player === 'player') {
            opponentShotsElem.appendChild(this.elem);
        }

        this.pos = [-1, -1];
        this.visible = false;
    }

    // private methods
    function draw() {
        /* jshint validthis:true */

        this.elem.style.left = this.pos[0] * constants.gridSpacing + 'px';
        this.elem.style.top = this.pos[1] * constants.gridSpacing + 'px';
    }

    function checkNotIntersecting(otherShot) {
        /* jshint validthis:true */
        
        return (this.pos[0] !== otherShot.pos[0] || this.pos[1] !== otherShot.pos[1]);
    }

    // public methods
    Shot.prototype.setVisible = function(visible) {
        if(visible) {
            this.elem.classList.remove('hide');
        } else {
            this.elem.classList.add('hide');
        }

        this.visible = visible;
    };

    Shot.prototype.setHit = function(hit) {
        if(hit) {
            this.elem.classList.add('grid__shot--hit');
        } else {
            this.elem.classList.remove('grid__shot--hit');
        }

        this.hit = hit;
    };

    Shot.prototype.move = function(position) {
        if(position[0] !== this.pos[0] || position[1] !== this.pos[1]) {
            this.pos = position;
            requestAnimationFrame(draw.bind(this));
        }
    };

    Shot.prototype.checkNotIntersecting = function(shots) {
        var self = this;

        return shots.every(function(otherShot) {
            return checkNotIntersecting.call(self, otherShot);
        });
    };

    Shot.prototype.destroy = function() {
        this.elem.parentNode.removeChild(this.elem);
    };

    return Shot;
})();
