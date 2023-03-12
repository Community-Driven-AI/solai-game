import { joyToKey } from './control/move'
import { stopAllPlay } from './js/index'
import { keys, lastKey } from './control/move'
import { sendPosition } from './control/move'
import { moveToXDirection } from './control/move'
import { battle } from './battle/battleClient'
import { player, User, users } from './user/user'
import { background, foreground } from './control/map'
import { setRenderables, setMovables, renderables } from './js/renderables'
import { Sprite } from './object/Sprite'
import { FixedObject, fixedObjects } from './object/FixedObject'

export const npcId = '250'

let previousTime = performance.now()

const npcTalk = (animationId) => {
  // if (animationId % 600 < 200) others['250'].sprite.chat = 'Come in'
  // else if (animationId % 600 < 400) others['250'].sprite.chat = 'Battle Zone'
  // else others['250'].sprite.chat = 'Click Me!'
}

var tower = new FixedObject(
  'tower',
  'BATTLE0',
  'GLOBAL MODEL',
  [1500, 1100],
  {
    max: 17,
    hold: 30,
  },
  ['Global Model Predicting...', "Tommorow's SOL:", '+10%', 'Click me to Copy Me!']
)
tower.clickEvent = () => {
  document.getElementById('download_modal').style.display = 'block'
}
var towerImage = new Image()
towerImage.src = '../img/octopus.png'
tower.sprite.setImage(towerImage)
tower.clickable = true
fixedObjects['tower'] = tower

var buildArea = new FixedObject(
  'buildArea',
  'BATTLE0',
  'BUILD AREA',
  [1000, 1100],
  {
    max: 1,
    hold: 30,
  },
  []
)
buildArea.clickEvent = () => {
  var localModel = new FixedObject(
    'localModel',
    'BATTLE0',
    'LOCAL MODEL',
    [1100, 1150],
    {
      max: 17,
      hold: 10,
    },
    []
  )
  buildArea.msgs = ["click the octopus to train!"]
  localModel.clickEvent = () => {
    document.getElementById('drop_modal').style.display = 'block'
  }
  var localModelImage = new Image()
  localModelImage.src = '../img/octopus.png'
  localModel.sprite.setImage(localModelImage)
  localModel.sprite.setScale(0.7)
  fixedObjects['localModel'] = localModel

  fixedObjects['localModel'].clickable = true
  fixedObjects['buildArea'].clickable = false
  fixedObjects['buildArea'].msgs = []
  player.dropItem()
}
var buildAreaImage = new Image()
buildAreaImage.src = '../img/green_area.png'
buildArea.sprite.setImage(buildAreaImage)
fixedObjects['buildArea'] = buildArea

var evaluateArea = new FixedObject(
  'evaluateArea',
  'BATTLE0',
  'BUILD AREA',
  [1800, 1000],
  {
    max: 1,
    hold: 30,
  },
  []
)
evaluateArea.clickEvent = () => {}
var evaluateAreaImage = new Image()
evaluateAreaImage.src = '../img/blue_area.png'
evaluateArea.sprite.setImage(evaluateAreaImage)
fixedObjects['evaluateArea'] = evaluateArea

var localModel1 = new FixedObject(
  'localModel1',
  'BATTLE0',
  'LOCAL MODEL',
  [1900, 1500],
  {
    max: 17,
    hold: 10,
  },
  []
)
var localModelImage = new Image()
localModelImage.src = '../img/octopus.png'
localModel1.sprite.setImage(localModelImage)
localModel1.sprite.setScale(0.7)
fixedObjects['localModel1'] = localModel1

var newUser = new User('player1', 'BATTLE0', 'User 1', [0, 0])
newUser.setSpriteImages('up', '../img/character/up.png')
newUser.setSpriteImages('down', '../img/character/down.png')
newUser.setSpriteImages('right', '../img/character/right.png')
newUser.setSpriteImages('left', '../img/character/left.png')

users['player1'] = newUser
users['player1'].setDirection('down')
users['player1'].setPosition({ x: 2000, y: 1475 }, true)

var localModel2 = new FixedObject(
  'localModel2',
  'BATTLE0',
  'LOCAL MODEL',
  [2100, 1250],
  {
    max: 17,
    hold: 10,
  },
  []
)
localModel2.sprite.setImage(localModelImage)
localModel2.sprite.setScale(0.7)
fixedObjects['localModel2'] = localModel2

var newUser = new User('player2', 'BATTLE0', 'User 2', [0, 0])
newUser.setSpriteImages('up', '../img/character/up.png')
newUser.setSpriteImages('down', '../img/character/down.png')
newUser.setSpriteImages('right', '../img/character/right.png')
newUser.setSpriteImages('left', '../img/character/left.png')

users['player2'] = newUser
users['player2'].setDirection('down')
users['player2'].setPosition({ x: 2025, y: 1200 }, true)

const canvas = document.querySelector('canvas')

export const animate = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const animationId = window.requestAnimationFrame(animate)

  background.draw()
  //   console.log(tower)
  //   foreground.draw()

  // NPC가 말하는거
  npcTalk(animationId)

  joyToKey()

  if (battle.started) return

  // 만약 채팅 중이라면 움직이지 않는다.
  if (document.getElementById('chatForm').style.display !== 'none') return

  // 아래부터는 나의 이동
  var newTime = performance.now()
  var passedTime = newTime - previousTime
  previousTime = newTime

  for (var key in users) {
    users[key].draw(passedTime)
  }
  for (var key in fixedObjects) {
    fixedObjects[key].draw(passedTime)
  }

  if (stopAllPlay) return

  player.setMoving(false)

  if (keys.w.pressed && lastKey === 'w') {
    moveToXDirection('up', 1, passedTime)
  } else if (keys.a.pressed && lastKey === 'a') {
    moveToXDirection('left', 1, passedTime)
  } else if (keys.s.pressed && lastKey === 's') {
    moveToXDirection('down', 1, passedTime)
  } else if (keys.d.pressed && lastKey === 'd') {
    moveToXDirection('right', 1, passedTime)
  }
  //   sendPosition(player.position)
}
