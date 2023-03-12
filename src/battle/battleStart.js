import { canvas, stopAllPlay } from '../js/index'
import { battle } from './battleClient'
import { myID, users, player } from '../user/user'
import { FixedObject, fixedObjects } from '../object/FixedObject'

/**
 * check whether click another player to battle.
 */
export function clickEvent() {
  canvas.addEventListener('click', (ev) => {
    for (const key in fixedObjects) {
      if (fixedObjects[key].checkClick(ev)) {
        fixedObjects[key].clickEvent()
      }
    }
  })
}

export function setUpBattleCard(type, key, battle_id) {
  var title
  var text
  if (type === 'request') {
    title = 'Request Battle...'
    text = `Request To: ${users[key].name}`
  } else if (type === 'accept') {
    title = 'Incoming Battle...'
    text = `Request From: ${users[key].name}`
  }
  document.getElementById('battleCard').innerHTML = `
    <h2>${title}</h2>
    <div style="margin:5px">
        <img src=${users[key].nftUrl}/>
    </div>
    <p>${text}</p>
    <button id="yesBattleBtn" class="nes-btn is-success">YES</button>
    <button id="noBattleBtn" class="nes-btn is-error">NO</button>
    `

  document.getElementById('yesBattleBtn').addEventListener('click', (e) => {
    if (type === 'request') {
      battle.request(key)
    } else if (type === 'accept') {
      battle.accept(battle_id, key)
    }
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
    document.getElementById('wait_modal').style.display = 'flex'
  })

  document.getElementById('noBattleBtn').addEventListener('click', (e) => {
    if (type === 'request') {
    } else if (type === 'accept') {
      battle.refuse(battle_id)
    }
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
  })

  document.getElementById('noBattleBtn').addEventListener('click', (e) => {
    if (type === 'request') {
    } else if (type === 'accept') {
      battle.refuse(battle_id)
    }
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
  })

  document.getElementById('battleCard').style.display = 'block'
}
