import constants from './constants';

export default (function() {
    'use strict';

    // dom elements
    var playerGrid = document.getElementsByClassName('grid--player')[0],
        playerCrosshairElem = playerGrid.getElementsByClassName('grid__crosshair')[0];

    // variables
    var hideClass = 'grid__crosshair--hide';

    // constructor
    function Crosshair(elem) {
        this.elem = elem;

        this.pos = [-1, -1];
        this.visible = false;
    }

    // private methods
    function draw() {
        /* jshint validthis:true */

        this.elem.style.left = this.pos[0] * constants.gridSpacing + 'px';
        this.elem.style.top = this.pos[1] * constants.gridSpacing + 'px';
    }

    // public methods
    Crosshair.prototype.setVisible = function(visible) {
        if(visible) {
            this.elem.classList.remove(hideClass);
        } else {
            this.elem.classList.add(hideClass);
        }

        this.visible = visible;
    };

    Crosshair.prototype.move = function(position) {
        if(position[0] !== this.pos[0] || position[1] !== this.pos[1]) {
            this.pos = position;
            requestAnimationFrame(draw.bind(this));
        }
    };

    return Crosshair;
})();
