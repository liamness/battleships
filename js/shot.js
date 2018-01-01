import constants from './constants.js';

// dom elements
const opponentGrid = document.getElementsByClassName('grid--opponent')[0];
const opponentShotsElem = opponentGrid.getElementsByClassName('grid__shots')[0];
const playerGrid = document.getElementsByClassName('grid--player')[0];
const playerShotsElem = playerGrid.getElementsByClassName('grid__shots')[0];

// constants
const className = 'grid__shot';
const hideClass = 'grid__shot--hide';
const hitClass = 'grid__shot--hit';

// private methods
function draw() {
  this.elem.style.left = `${this.pos[0] * constants.gridSpacing}px`;
  this.elem.style.top = `${this.pos[1] * constants.gridSpacing}px`;
}

function checkNotIntersecting(otherShot) {
  return (this.pos[0] !== otherShot.pos[0] || this.pos[1] !== otherShot.pos[1]);
}

export default class {
  constructor(player) {
    this.elem = document.createElement('div');
    this.elem.classList.add(className, hideClass);

    if (player === 'opponent') {
      playerShotsElem.appendChild(this.elem);
    } else if (player === 'player') {
      opponentShotsElem.appendChild(this.elem);
    }

    this.pos = [-1, -1];
    this.visible = false;
  }

  setVisible(visible) {
    if (visible) {
      this.elem.classList.remove(hideClass);
    } else {
      this.elem.classList.add(hideClass);
    }

    this.visible = visible;
  }

  setHit(hit) {
    if (hit) {
      this.elem.classList.add(hitClass);
    } else {
      this.elem.classList.remove(hitClass);
    }

    this.hit = hit;
  }

  move(position) {
    if (position[0] !== this.pos[0] || position[1] !== this.pos[1]) {
      this.pos = position;
      requestAnimationFrame(draw.bind(this));
    }
  }

  checkNotIntersecting(shots) {
    return shots.every(otherShot => checkNotIntersecting.call(this, otherShot));
  }

  destroy() {
    this.elem.parentNode.removeChild(this.elem);
  }
}
