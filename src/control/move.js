import { JoyStick } from './joystick'
import { adjustMapPosition, background, transferMapTo } from './map'
import {
  checkForCharacterCollision,
  userBoundaryCollision,
} from './checkCollision'
import { movables } from '../js/renderables'
import { users, myID, player } from '../user/user'
import { allowedBlocks } from '../data/collisions'
import { portals } from '../data/portals'
import { fixedObjects } from '../object/FixedObject'

export let lastKey = ''

export let keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break

    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break

    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

var joy = new JoyStick('joyDiv')
var joyStickMoving = false
export function joyToKey() {
  var x = joy.GetX()
  var y = joy.GetY()
  var moving = false
  if (y > 45) {
    keys.w.pressed = true
    lastKey = 'w'
    moving = true
  } else if (y < -45) {
    keys.s.pressed = true
    lastKey = 's'
    moving = true
  } else if (x > 45) {
    keys.d.pressed = true
    lastKey = 'd'
    moving = true
  } else if (x < -45) {
    keys.a.pressed = true
    lastKey = 'a'
    moving = true
  } else if (joyStickMoving) {
    keys.w.pressed = false
    keys.a.pressed = false
    keys.s.pressed = false
    keys.d.pressed = false
    joyStickMoving = false
  }
  joyStickMoving = moving
}

const lastSentPosition = {
  x: -100,
  y: -100,
}

function distancePowerofTwo(a, b) {
  return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
}

const speed = 0.3
export function moveToXDirection(direction, num = 1, passedTime) {
  var moving = true
  const plusOrNot = (direction === 'up') | (direction === 'left') ? 1 : -1
  const isX = (direction === 'left') | (direction === 'right') ? 1 : 0
  const isY = (direction === 'up') | (direction === 'down') ? 1 : 0

  const movedDistance = num * speed * passedTime
  const deltaX = movedDistance * plusOrNot * isX
  const deltaY = movedDistance * plusOrNot * isY

  player.setMoving(true)
  player.setDirection(direction)

  var myBlock = player.getNextBlock({
    x: deltaX,
    y: deltaY,
  })

  if (fixedObjects['tower'].msgs.length > 0) {
    var distance = distancePowerofTwo(
      fixedObjects['tower'].position,
      player.position
    )
  }

  // collision check
  if (allowedBlocks[player.map][myBlock[0]][myBlock[1]] === 'X') moving = false
  var portal = portals[player.map][myBlock[0]][myBlock[1]]
  if (portal !== 'X') {
    transferMapTo(portal)
    return
  }

  if (moving) {
    player.setPosition(
      {
        x: player.position.x - deltaX,
        y: player.position.y - deltaY,
      },
      true
    )
    adjustMapPosition()
  }
}
