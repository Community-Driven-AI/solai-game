import { Sprite } from '../object/Sprite'
import { canva } from '../js/index'
import { local_position } from '../control/map'

const chatBubble = new Image()
chatBubble.src = './../img/chatBubble.png'

export let player

export function setPlayer(a) {
  player = a
}
export let myID = 'myID'
export const users = {}

const terraLogo = new Image()
terraLogo.src = './../img/terra.png'

const nearLogo = new Image()
nearLogo.src = './../img/near.png'

const polygonLogo = new Image()
polygonLogo.src = './../img/polygonlogo.png'

const READYTEXT = 'Ready for Battle'

export function setMyID(id) {
  myID = id
}

export class User {
  id
  name
  sprite
  spriteImgs
  targetPosition
  position
  map
  moving
  chat
  chatShowTime
  holdingItem

  constructor(id, map, name, coordinate) {
    if (id === myID) {
      player = this
    }

    this.position = { x: coordinate[0], y: coordinate[1] }
    if (coordinate[0] === 0 && coordinate[1] === 0) {
      this.position.x = 1500
      this.position.y = 350
    }
    this.targetPosition = this.position

    this.id = id
    this.map = map

    this.name = name

    this.sprite = new Sprite({
      position: this.position,
      frames: {
        max: 4,
        hold: 10,
      },
    })
    this.spriteImgs = {
      up: new Image(),
      down: new Image(),
      left: new Image(),
      right: new Image(),
    }
    this.moving = false
    this.chat = ''
    this.chatShowTime = 0
    this.holdingItem = new Image()
  }

  setSpriteImages(direction, imageSrc) {
    this.spriteImgs[direction].src = imageSrc
  }

  setDirection(direction) {
    this.sprite.setImage(this.spriteImgs[direction])
  }

  setPosition(position, instant) {
    if (instant) {
      this.targetPosition = position
      this.position = position
      this.sprite.position = local_position(position)
    } else {
      this.targetPosition = position
    }
  }

  holdItem(itemImageSrc) {
    this.holdingItem.src = itemImageSrc
  }

  dropItem() {
    this.holdingItem.src = ''
  }

  getNextBlock(delta) {
    var i = Math.floor((this.position.y + this.sprite.height - delta.y) / 80)
    var j = Math.floor((this.position.x + this.sprite.width / 2 - delta.x) / 80)
    return [i, j]
  }

  showChat(chat) {
    this.chat = chat
    this.chatShowTime = 0
  }

  setMoving(moving) {
    this.moving = moving
    this.sprite.animate = moving
  }

  draw(passedTime) {
    if (this.id !== myID) {
      var moveDistance = 0.4 * passedTime

      var moveInX = this.targetPosition.x - this.position.x
      var moveInY = this.targetPosition.y - this.position.y

      if (moveInX > 100) {
        moveDistance *= 2
      }
      if (moveInY > 100) {
        moveDistance *= 2
      }
      this.setMoving(true)
      if (moveInX >= moveDistance) {
        this.position.x += moveDistance
      } else if (moveInX <= -1 * moveDistance) {
        this.position.x -= moveDistance
      } else if (moveInY >= moveDistance) {
        this.position.y += moveDistance
      } else if (moveInY <= -1 * moveDistance) {
        this.position.y -= moveDistance
      } else {
        this.setMoving(false)
      }
    }

    this.sprite.position = local_position(this.position)

    canva.font = '15px "210L"'
    canva.textAlign = 'center'
    if (this.readyForBattle) {
      canva.fillStyle = 'red'
      canva.fillText(
        READYTEXT,
        this.sprite.position.x + this.sprite.width / 2,
        this.sprite.position.y - 50
      )
    }

    canva.font = '15px "210L"'
    canva.textAlign = 'center'
    if (this.id === myID) {
      canva.fillStyle = 'red'
      canva.fillText(
        '▼',
        this.sprite.position.x + this.sprite.width / 2,
        this.sprite.position.y - 50
      )
    }

    canva.fillStyle = 'black'
    if (this.chat.length > 0) {
      var textWidth = canva.measureText(this.chat).width
      this.chatShowTime += 1
      canva.drawImage(
        chatBubble,
        this.sprite.position.x + 40,
        this.sprite.position.y - 70,
        150,
        80
      )

      canva.fillText(
        this.chat,
        this.sprite.position.x + textWidth / 2 + 60,
        this.sprite.position.y - 39
      )

      if (this.chatShowTime > 600) this.chat = ''
    }

    canva.fillText(
      this.name,
      this.sprite.position.x + this.sprite.width / 2,
      this.sprite.position.y
    )
    // draw logo
    if (this.chain === 'TERRA') {
      canva.drawImage(
        terraLogo,
        this.sprite.position.x + this.sprite.width / 2 - 5,
        this.sprite.position.y - 36,
        17,
        17
      )
    } else if (this.chain === 'NEAR') {
      canva.drawImage(
        nearLogo,
        this.sprite.position.x + this.sprite.width / 2 - 5,
        this.sprite.position.y - 36,
        17,
        17
      )
    } else if (this.chain === 'POLYGON') {
      canva.drawImage(
        polygonLogo,
        this.sprite.position.x + this.sprite.width / 2 - 5,
        this.sprite.position.y - 36,
        17,
        17
      )
    }

    this.sprite.draw()

    // holding item draw
    if (
      this.holdingItem.naturalHeight !== 0 &&
      this.holdingItem.naturalWidth !== 0
    ) {
      canva.drawImage(
        this.holdingItem,
        this.sprite.position.x + 50,
        this.sprite.position.y
      )
    }
  }
}
