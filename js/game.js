import constants from './constants.js';
import Crosshair from './crosshair.js';
import Ship from './ship.js';
import Shot from './shot.js';

// dom elements
const notificationArea = document.getElementsByClassName('notification-area')[0];
const opponentGrid = document.getElementsByClassName('grid--opponent')[0];
const opponentShipElems = opponentGrid.querySelectorAll('.grid__ships .grid__ship');
const playerGrid = document.getElementsByClassName('grid--player')[0];
const playerShipElems = playerGrid.querySelectorAll('.grid__ships .grid__ship');

// constants
const crosshair = new Crosshair();

// variables
let opponentShips;
let playerShips;
let opponentShots;
let playerShots;

// private functions
function notify(notification) {
  notificationArea.textContent = notification;
}

function checkInBounds(value) {
  return Math.min(constants.gridSize - 1, Math.max(0, Math.floor(value)));
}

function opponentPlaceShip(index) {
  const ship = new Ship(opponentShipElems[index], constants.shipSizes[index], true);

  // rotate the ship half the time
  if (Math.random() < 0.5) {
    ship.rotate();
  }

  const xPos = Math.round((constants.gridSize - ship.size[0]) * Math.random());
  const yPos = Math.round((constants.gridSize - ship.size[1]) * Math.random());

  ship.move([xPos, yPos]);

  if (ship.checkNotIntersecting(opponentShips)) {
    opponentShips.push(ship);

    if (index + 1 < constants.shipSizes.length) { opponentPlaceShip(index + 1); }
  } else {
    opponentPlaceShip(index);
  }
}

function playerPlaceShip(index) {
  const ship = new Ship(playerShipElems[index], constants.shipSizes[index]);

  function mousemoveListener(e) {
    if (!ship.visible) { ship.setVisible(true); }

    const newX = Math.round((e.offsetX / constants.gridSpacing) - (ship.size[0] / 2));
    const newY = Math.round((e.offsetY / constants.gridSpacing) - (ship.size[1] / 2));

    if (newX !== ship.pos[0] || newY !== ship.pos[1]) {
      ship.move([newX, newY]);

      if (ship.checkNotIntersecting(playerShips)) {
        ship.setHighlight(false);
      } else {
        ship.setHighlight(true);
      }
    }
  }

  function keyupListener(e) {
    if (e.keyCode === 13) { // enter
      ship.rotate();

      if (ship.checkNotIntersecting(playerShips)) {
        ship.setHighlight(false);
      } else {
        ship.setHighlight(true);
      }
    }
  }

  function clickListener() {
    if (!ship.highlight) {
      playerGrid.removeEventListener('mousemove', mousemoveListener);
      window.removeEventListener('keyup', keyupListener);
      playerGrid.removeEventListener('click', clickListener);

      playerShips.push(ship);

      const shipPlacedEvent = new CustomEvent('PLAYER_PLACED_SHIP', { detail: { index } });
      window.dispatchEvent(shipPlacedEvent);
    }
  }

  playerGrid.addEventListener('mousemove', mousemoveListener);
  window.addEventListener('keyup', keyupListener);
  playerGrid.addEventListener('click', clickListener);
}

function playerPlaceShips() {
  const shipPlacedListener = (e) => {
    const newIndex = e.detail.index + 1;

    if (newIndex < constants.shipSizes.length) {
      playerPlaceShip(newIndex);
    } else {
      window.removeEventListener('PLAYER_PLACED_SHIP', shipPlacedListener);
      opponentPlaceShip(0);
      this.setState('shoot');
    }
  };

  window.addEventListener('PLAYER_PLACED_SHIP', shipPlacedListener);

  playerPlaceShip(0);
}

// code for firing
function playerShoot() {
  let shot;

  const mousemoveListener = (e) => {
    if (!shot) { shot = new Shot('player'); }

    if (!crosshair.visible) { crosshair.setVisible(true); }

    const newX = checkInBounds(Math.floor(e.offsetX / constants.gridSpacing));
    const newY = checkInBounds(Math.floor(e.offsetY / constants.gridSpacing));

    if (newX !== shot.pos[0] || newY !== shot.pos[1]) {
      shot.move([newX, newY]);
      crosshair.move([newX, newY]);
    }
  };

  const clickListener = () => {
    // check we haven't already taken this shot
    if (shot && shot.checkNotIntersecting(playerShots)) {
      playerShots.push(shot);
      shot.setVisible(true);
      crosshair.setVisible(false);

      opponentGrid.removeEventListener('click', clickListener);
      opponentGrid.removeEventListener('mousemove', mousemoveListener);

      // check if we've hit anything
      const success = opponentShips.some((ship) => {
        if (ship.checkHit(shot)) {
          if (ship.sunk) {
            this.setState('sunk');
          } else {
            this.setState('hit');
          }

          return true;
        }

        return false;
      });

      if (success) {
        shot.setHit(true);

        // check if we've sunk all the ships
        if (opponentShips.every(ship => ship.sunk)) {
          this.setState('win');
        }
      } else {
        this.setState('miss');
      }
    }
  };

  opponentGrid.addEventListener('mousemove', mousemoveListener);
  opponentGrid.addEventListener('click', clickListener);
}

class Game {
  startGame() {
    this.setState('start');
  }

  setState(state) {
    if (state !== 'reset' && this.state === 'win') {
      return;
    }

    switch (state) {
      case 'shoot':
        notify('Take aim');
        playerShoot.call(this);
        break;
      case 'miss':
        notify('You missed...');
        setTimeout(() => { this.setState('shoot'); }, 500);
        break;
      case 'hit':
        notify('Direct hit!');
        setTimeout(() => { this.setState('shoot'); }, 500);
        break;
      case 'sunk':
        notify('Ship sunk!');
        setTimeout(() => { this.setState('shoot'); }, 500);
        break;
      case 'win': {
        notify('You won! Click here to try again');

        const clickListener = () => {
          this.setState('reset');
          notificationArea.removeEventListener('click', clickListener);
        };

        notificationArea.addEventListener('click', clickListener);

        break;
      }
      case 'reset':
        // hide ships
        opponentShips.concat(playerShips).forEach((ship) => {
          ship.setVisible(false);
        });

        // remove shots
        opponentShots.concat(playerShots).forEach((shot) => {
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
  }
}

// start game
const game = new Game();
game.startGame();
