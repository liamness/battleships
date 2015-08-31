import constants from './constants';
import Crosshair from './crosshair';
import Ship from './ship';
import Shot from './shot';

export default (function() {
    'use strict';

    // dom elements
    var notificationArea = document.getElementsByClassName('notification-area')[0],
        opponentGrid = document.getElementsByClassName('grid--opponent')[0],
        opponentShipElems = opponentGrid.querySelectorAll('.grid__ships .grid__ship'),
        playerGrid = document.getElementsByClassName('grid--player')[0],
        playerShipElems = playerGrid.querySelectorAll('.grid__ships .grid__ship'),
        playerCrosshairElem = opponentGrid.getElementsByClassName('grid__crosshair')[0];

    // variables
    var opponentShips, playerShips, opponentShots, playerShots,
        crosshair = new Crosshair(playerCrosshairElem);

    // constructor
    function Game() {
        this.setState('start');
    }

    // private functions
    function notify(notification) {
        notificationArea.textContent = notification;
    }

    function checkInBounds(value) {
        return Math.min(constants.gridSize - 1, Math.max(0, Math.floor(value)));
    }

    function opponentPlaceShip(index) {
        var ship = new Ship(opponentShipElems[index], constants.shipSizes[index], true);

        // rotate the ship half the time
        if(Math.random() < 0.5) {
            ship.rotate();
        }

        var xPos = Math.round((constants.gridSize - ship.size[0]) * Math.random()),
            yPos = Math.round((constants.gridSize - ship.size[1]) * Math.random());

        ship.move([xPos, yPos]);

        if(ship.checkNotIntersecting(opponentShips)) {
            opponentShips.push(ship);

            if(++index < constants.shipSizes.length) { opponentPlaceShip(index); }
        } else {
            opponentPlaceShip(index);
        }
    }

    function playerPlaceShip(index) {
        var ship = new Ship(playerShipElems[index], constants.shipSizes[index]);

        var mousemoveListener = function(e) {
            if(!ship.visible) { ship.setVisible(true); }

            var newX = Math.round(e.offsetX / constants.gridSpacing - (ship.size[0] / 2)),
                newY = Math.round(e.offsetY / constants.gridSpacing - (ship.size[1] / 2));

            if(newX !== ship.pos[0] || newY !== ship.pos[1]) {
                ship.move([newX, newY]);

                if(ship.checkNotIntersecting(playerShips)) {
                    ship.setHighlight(false);
                } else {
                    ship.setHighlight(true);
                }
            }
        };

        var keyupListener = function(e) {
            if(e.keyCode === 13) { // enter
                ship.rotate();

                if(ship.checkNotIntersecting(playerShips)) {
                    ship.setHighlight(false);
                } else {
                    ship.setHighlight(true);
                }
            }
        };

        var clickListener = function() {
            if(!ship.highlight) {
                playerGrid.removeEventListener('mousemove', mousemoveListener);
                window.removeEventListener('keyup', keyupListener);
                playerGrid.removeEventListener('click', clickListener);

                playerShips.push(ship);

                var shipPlacedEvent = new CustomEvent('PLAYER_PLACED_SHIP', {detail: {index: index}});
                window.dispatchEvent(shipPlacedEvent);
            }
        };

        playerGrid.addEventListener('mousemove', mousemoveListener);
        window.addEventListener('keyup', keyupListener);
        playerGrid.addEventListener('click', clickListener);
    }

    function playerPlaceShips() {
        /* jshint validthis:true */

        var self = this;

        var shipPlacedListener = function(e) {
            var newIndex = ++e.detail.index;

            if(newIndex < constants.shipSizes.length) {
                playerPlaceShip(newIndex);
            } else {
                window.removeEventListener('PLAYER_PLACED_SHIP', shipPlacedListener);
                opponentPlaceShip(0);
                self.setState('shoot');
            }
        };

        window.addEventListener('PLAYER_PLACED_SHIP', shipPlacedListener);

        playerPlaceShip(0);
    }

    // code for firing
    function playerShoot() {
        /* jshint validthis:true */
        
        var self = this;

        var shot = new Shot('player');

        var mousemoveListener = function(e) {
            if(!crosshair.visible) { crosshair.setVisible(true); }

            var newX = checkInBounds(Math.floor(e.offsetX / constants.gridSpacing)),
                newY = checkInBounds(Math.floor(e.offsetY / constants.gridSpacing));

            if(newX !== shot.pos[0] || newY !== shot.pos[1]) {
                shot.move([newX, newY]);
                crosshair.move([newX, newY]);
            }
        };

        var clickListener = function() {
            // check we haven't already taken this shot
            if(shot.checkNotIntersecting(playerShots)) {
                playerShots.push(shot);
                shot.setVisible(true);
                crosshair.setVisible(false);

                opponentGrid.removeEventListener('click', clickListener);
                opponentGrid.removeEventListener('mousemove', mousemoveListener);

                // check if we've hit anything
                var success = opponentShips.some(function(ship) {
                    if (ship.checkHit(shot)) {
                        if(ship.sunk) {
                            self.setState('sunk');
                        } else {
                            self.setState('hit');
                        }

                        return true;
                    }
                });

                if(success) {
                    shot.setHit(true);

                    // check if we've sunk all the ships
                    if(opponentShips.every(function(ship) { return ship.sunk; })) {
                        self.setState('win');
                    }
                } else {
                    self.setState('miss');
                }
            }
        };

        opponentGrid.addEventListener('mousemove', mousemoveListener);
        opponentGrid.addEventListener('click', clickListener);
    }

    // public functions
    Game.prototype.setState = function(state) {
        if(state !== 'reset' && this.state === 'win') {
            return;
        }

        var self = this;

        switch(state) {
            case 'shoot':
                notify('Take aim');
                playerShoot.call(this);
                break;
            case 'miss':
                notify('You missed...');
                setTimeout(function() { self.setState('shoot'); }, 500);
                break;
            case 'hit':
                notify('Direct hit!');
                setTimeout(function() { self.setState('shoot'); }, 500);
                break;
            case 'sunk':
                notify('Ship sunk!');
                setTimeout(function() { self.setState('shoot'); }, 500);
                break;
            case 'win':
                notify('You won! Click here to try again');

                var clickListener = function() {
                    self.setState('reset');
                    notificationArea.removeEventListener('click', clickListener);
                };

                notificationArea.addEventListener('click', clickListener);

                break;
            case 'reset':
                // hide ships
                opponentShips.concat(playerShips).forEach(function(ship) {
                    ship.setVisible(false);
                });

                // remove shots
                opponentShots.concat(playerShots).forEach(function(shot) {
                    shot.destroy();
                });
                
                /* falls through */
            case 'start':
                /* falls through */
            default:
                opponentShips = [];
                playerShips = [];
                opponentShots = [];
                playerShots = [];

                notify('Place your ships');
                playerPlaceShips.call(this);
                break;
        }

        this.state = state;
    };

    return Game;
})();
