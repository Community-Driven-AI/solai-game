import { animate } from '../animate'
import { Sprite } from '../object/Sprite'
import { others, attack } from '../network/websocket'
import { player, canva } from '../js/index'
import { battle } from './battleClient'
import { Monster } from '../object/Monster'
import { gsap } from 'gsap'
import { battleAnimationId } from './enterBattle'
import { playerUrl } from '../web/logIn'
import { userDummy } from '../object/makeOthers'
import { ATTACKS, DEFENCES, SKILL_DESCRIPTIONS } from '../js/skills'
import { selectedSkill, selectedDefenceSkills } from '../web/initialSetting'

const battleBackgroundImage = new Image()
battleBackgroundImage.src = './../img/Beach sunset.jpg'

export const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
})

export let opponent
export let myMonster
export let renderedSprites
export let queue

/** 공격이 들어와서 내가 공격을 받음 */
export function renderState(data, battleState) {
  var mySkill = battle.getPlayerAction(data.my_index)
  var opSkill = battle.getPlayerAction(1 - data.my_index)
  document
    .querySelector('#battleHistoryContent')
    .append(
      myMonster.name +
        ' used ' +
        mySkill.name +
        '\n' +
        opponent.name +
        ' used ' +
        opSkill.name
    )

  myMonster.adjustHealth(battleState.player_lp[data.my_index])
  opponent.adjustHealth(battleState.player_lp[1 - data.my_index])
  mySkill.render(myMonster, opponent, renderedSprites)
  opSkill.render(opponent, myMonster, renderedSprites)

  if (myMonster.health <= 0) {
    myMonster.faint()
    endBattle('LOSE')
  }
  // 내가 이긴 경우
  else if (opponent.health <= 0) {
    opponent.faint()
    endBattle('WIN')
  }
  document.querySelector('#playerEffectsBox').innerHTML = ''
  battleState.lasting_effects.forEach((e) => {
    document.querySelector('#playerEffectsBox').append(`${JSON.stringify(e)}`)
  })

  document.querySelector('#enemyEffectsBox').innerHTML = ''
  battleState.lasting_effects.forEach((e) => {
    document.querySelector('#enemyEffectsBox').append(`${JSON.stringify(e)}`)
  })
}

export function setUpNextSetting() {
  if (battle.isMyAttack())
    document.querySelector('#atk_or_def').innerText = 'ATTACK'
  else document.querySelector('#atk_or_def').innerText = 'DEFENSE'

  document.querySelectorAll('.atk_skill_buttons').forEach((e) => {
    e.disabled = !battle.isMyAttack()
  })
  document.querySelectorAll('.def_skill_buttons').forEach((e) => {
    e.disabled = battle.isMyAttack()
  })
}

/**
 *
 * @param {'win' | 'lose'} result 이겼으면 win, 졌으면 lose
 */
export function endBattle(result) {
  battle.endBattle()
  if (result === 'win') {
    console.log('이겼다.')
  } else if (result === 'lose') {
    console.log('졌다.')
  }

  queue.push(() => {
    // fade back to black
    gsap.to('#overlappingDiv', {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId)
        animate()
        document.querySelector('#userInterface').style.display = 'none'
        document.getElementById('battleResultCard').style.display = 'block'
        document.getElementById('battleResult').innerText = `You ${result}!`
        document.querySelector('#joyDiv').style.display = 'block'
        gsap.to('#overlappingDiv', {
          opacity: 0,
        })
        battle.started = false
      },
    })
  })
}

/**
 * 진짜 배틀 시작, 배틀 맵으로 이동
 */
export function initBattle() {
  //   canva.width = window.innerWidth
  //   canva.height = window.innerHeight
  console.log(battle.data)
  document.querySelector('#joyDiv').style.display = 'none'
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  // document.querySelector('#attacksBox').replaceChildren()
  document.querySelector('#battleMyName').innerHTML = `me(${player.name})`
  document.querySelector('#battleOpponentName').innerHTML = `opponent(${
    others[battle.data.opponent_id].sprite.name
  })`

  //   if (!my_attack) {
  // document.querySelector('#dialogueBox').style.display = 'block'
  // document.querySelector('#dialogueBox').innerHTML = 'Wait For your turn'
  //   }
  var battleState = battle.battleState
  const opponentUser = {
    image: others[battle.data.opponent_id].baseImage,
    isEnemy: true,
    name: others[battle.data.opponent_id].sprite.name,
    health: battle.data.player_init_lp[1 - battle.data.my_index],
    skills: battleState.player_skills[1 - battle.data.my_index],
  }

  opponent = new Monster(opponentUser)
  opponent.adjustHealth(battleState.player_lp[1 - battle.data.my_index])

  // const myCharacter = {
  //   image: player.baseImage,
  //   isEnemy: false,
  //   name: player.name,
  //   health: skillTypes[mySkillType].health,
  //   attacks: JSON.parse(JSON.stringify(skillTypes[mySkillType].atk)),
  //   defenses: skillTypes[mySkillType].def,
  // }
  const myCharacter = {
    image: player.baseImage,
    isEnemy: false,
    name: player.name,
    health: battle.data.player_init_lp[battle.data.my_index],
    skills: battleState.player_skills[battle.data.my_index],
  }

  myMonster = new Monster(myCharacter)
  myMonster.adjustHealth(battleState.player_lp[battle.data.my_index])

  renderedSprites = [opponent, myMonster]

  queue = []

  enterImageAnimation()
  document.getElementById('battle_skills').style.display = 'block'
  document.getElementById('battle_banner').style.display = 'block'
}

// document.querySelector('#battle_enter').style.opacity = 1
// document.querySelector('.main_container').style.display = 'none'

const enterImageAnimation = () => {
  document.getElementById('enter_img').src = playerUrl
  document.getElementById('opp_enter_img').src = userDummy.userImageUrl
  document.getElementById('enter_collection').innerText = player.nftName
  document.getElementById('enter_name').innerText = player.name
  for (var i = 0; i < 3; i++) {
    var skillName = ATTACKS[selectedSkill[i]]
    var desc_item = document.createElement('div')
    desc_item.setAttribute('class', 'desc_item')
    var skill_label = document.createElement('div')
    skill_label.setAttribute('class', 'skill_label')
    skill_label.innerText = `Attack ${i + 1}`
    desc_item.append(skill_label)
    var skill_img_container = document.createElement('div')
    skill_img_container.setAttribute('class', 'skill_img_container')
    var skill_img = document.createElement('img')
    skill_img.setAttribute('class', 'skill_img')
    skill_img.src = `../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillName].img}`
    skill_img_container.append(skill_img)
    desc_item.append(skill_img_container)
    document.getElementById('selected_attack_skills').append(desc_item)

    var skillName = DEFENCES[selectedSkill[i]]
    var desc_item = document.createElement('div')
    desc_item.setAttribute('class', 'desc_item')
    var skill_label = document.createElement('div')
    skill_label.setAttribute('class', 'skill_label')
    skill_label.innerText = `Attack ${i + 1}`
    desc_item.append(skill_label)
    var skill_img_container = document.createElement('div')
    skill_img_container.setAttribute('class', 'skill_img_container')
    var skill_img = document.createElement('img')
    skill_img.setAttribute('class', 'skill_img')
    skill_img.src = `../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillName].img}`
    skill_img_container.append(skill_img)
    desc_item.append(skill_img_container)
    document.getElementById('selected_defence_skills').append(desc_item)
  }
  console.log('열리는 실행')
  document.querySelector('#battle_enter').style.transition = 'all 0s ease-out'
  document.querySelector('#battle_enter').style.opacity = 1
  document.querySelector('#battle_enter').style.zIndex = 1000
  setTimeout(() => {
    console.log('닫히는게 실행')
    document.querySelector('#battle_enter').style.transition =
      'all 1.2s ease-out'
    document.querySelector('#battle_enter').style.opacity = 0
    document.querySelector('#battle_enter').style.zIndex = -5
  }, 5000)
}