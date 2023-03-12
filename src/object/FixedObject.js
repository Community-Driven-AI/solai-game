import { Sprite } from './Sprite'
import { canva, local_position } from '../js/index'

const chatBubble = new Image()
chatBubble.src = './../img/chatBubble.png'

export const fixedObjects = {}

export class FixedObject {
  id
  name
  sprite
  position
  map
  msg
  showTime
  clickable
  clickEvent

  constructor(id, map, name, coordinate, frames, msgs) {
    this.position = { x: coordinate[0], y: coordinate[1] }

    this.id = id
    this.map = map

    this.name = name

    this.sprite = new Sprite({
      position: this.position,
      frames: frames,
    })
    this.msgs = msgs
    this.msg_index = 0
    this.showTime = 0
    this.clickable = false
  }

  checkClick(ev) {
    var offsetX = ev.offsetX
    var offsetY = ev.offsetY
    return (
      this.clickable &&
      offsetX > this.sprite.position.x &&
      offsetX < this.sprite.position.x + this.sprite.width &&
      offsetY > this.sprite.position.y &&
      offsetY < this.sprite.position.y + this.sprite.height
    )
  }

  draw(passedTime) {
    this.sprite.position = local_position(this.position)

    this.showTime += passedTime
    if (this.msgs.length > 0) {
      if (this.showTime > 3 * 1000) {
        this.showTime = 0
        this.msg_index = (this.msg_index + 1) % this.msgs.length
      }

      canva.drawImage(
        chatBubble,
        this.sprite.position.x + this.sprite.width / 2 + 100,
        this.sprite.position.y - 150,
        400,
        200
      )

      canva.font = '25px "210L"'
      canva.fillStyle = 'red'

      canva.fillText(
        this.msgs[this.msg_index],
        this.sprite.position.x + this.sprite.width / 2 + 300,
        this.sprite.position.y - 80
      )

      canva.fillStyle = 'black'
      canva.font = '15px "210L"'
    }

    canva.fillText(
      this.name,
      this.sprite.position.x + this.sprite.width / 2,
      this.sprite.position.y
    )
    this.sprite.draw()
  }
}
