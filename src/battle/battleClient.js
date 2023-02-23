import { ethers } from 'ethers'
import { playerUrl, selectedClothId, tokenId } from '../user/logIn'
import {
  battleBackground,
  initBattle,
  renderState,
  setBattleBackground,
  setUpNextSetting,
} from './battleScene'
import { safe_send } from '../network/websocket'
import { selectedSkill, selectedDefenceSkills } from './initialSetting'
import { BattleState } from './battleState'
import { animateBattle, enterBattle } from './enterBattle'
import { wallet } from '../wallet/multi-wallet'

export const BATTLE_CONTRACT = 'game.web3mon.testnet'
const FT_CONTRACT = 'usdc.web3mon.testnet' // USDC.e contract ID
const BET_AMOUNT = '100000000'
const resume_data = {
  battle_data: {},
  jwt: '',
  playerUrl: '',
  token_id: '',
  clothId: '',
  opponentId: '',
}

class BattleClient {
  data
  keyManager
  receiveQueue
  types
  mode

  constructor() {
    this.keyManager = ethers.Wallet.createRandom()
    this.receiveQueue = []
    this.data = { status: { isOk: false, stage: 'reveal' } }
    this.started = false
  }

  // battle request to opponent
  async request(receiver_player_id) {
    safe_send({
      BattlePropose: {
        receiver_player_id: receiver_player_id,
        battle_pub_key: this.keyManager.publicKey.substring(2),
      },
    })
    this.data.opponent_id = receiver_player_id
  }

  // accept offered battle from opponent
  async accept(battle_id, proposer_player_id) {
    safe_send({
      BattleAccept: {
        battle_id: battle_id,
        battle_pub_key: this.keyManager.publicKey.substring(2),
      },
    })
    this.data.opponent_id = proposer_player_id
  }

  async refuse(battle_id) {
    safe_send({
      BattleReject: {
        battle_id: battle_id,
      },
    })
  }

  // start battle (move fund to battle contract)
  async start(msg) {
    var battleInfo = {
      current_turn_expired_at: msg.next_turn_expired_at,
      player_pk: [
        this.keyManager.publicKey.substring(2),
        msg.opponent_battle_exclusive_pub_key,
      ],
      manager_pk: msg.manager_battle_exclusive_pub_key,
      players_account: [wallet.accountId, 'bot'],
      game_turn_sequence: 0,
    }

    console.log(
      JSON.stringify({
        receiver_id: 'game.web3mon.testnet',
        amount: BET_AMOUNT,
        msg: JSON.stringify({
          battle_id: msg.battle_id,
          battle_create_info: {
            player_pk: battleInfo.player_pk,
            manager_pk: battleInfo.manager_pk,
            bet_amount: BET_AMOUNT,
            players_account: ['bob.web3mon.testnet', 'bob.web3mon.testnet'],
          },
        }),
      })
    )
    console.log(battleInfo)

    // var battleInfo = await wallet.viewMethod({
    //   contractId: BATTLE_CONTRACT,
    //   method: 'get_battle',
    //   args: { battle_id: msg.battle_id },
    // })
    // console.log(battleInfo)

    battleInfo.player_pk.sort()

    var my_index

    if (battleInfo.player_pk[0] === this.keyManager.publicKey.substring(2))
      my_index = 0
    else if (battleInfo.player_pk[1] === this.keyManager.publicKey.substring(2))
      my_index = 1
    else return false

    this.battleState = new BattleState(battleInfo)
    this.choseAction = false

    this.data = {
      battleId: msg.battle_id,
      opponent_id: this.data.opponent_id,
      mode: 'channel',
      oldBattleState: '',
      my_index: my_index,
      op_commit: '',
      op_commit_signature: '',
      status: { isOk: false, stage: 'commit' },
      actions: { 0: null, 1: null },
      manager_signature: '',
      player_signatures: ['', ''],
      op_pk: battleInfo.player_pk[1 - my_index],
      manager_pk: battleInfo.manager_pk,
      my_sk: this.keyManager.privateKey,
      player_init_lp: this.battleState.player_lp,
      pick_until_time: Date.now() + 1000 * 100,
      battleBackground: 0,
    }

    // this.types = await wallet.viewMethod({
    //   contractId: BATTLE_CONTRACT,
    //   method: 'get_types',
    //   args: {},
    // })

    this.save()

    // location.reload()

    // moving funds to battle contract
    await wallet.callMethod({
      contractId: FT_CONTRACT,
      method: 'ft_transfer_call',
      args: {
        receiver_id: BATTLE_CONTRACT,
        amount: BET_AMOUNT,
        msg: JSON.stringify({
          battle_id: msg.battle_id,
          player_index: my_index,
        }),
      },
      deposit: 1,
    })

    this.started = true
    return true
  }

  event(content) {
    console.log(content)
  }

  save() {
    resume_data.battle_data = this.data
    resume_data.battle_data.battle_state = this.battleState.write()
    resume_data.playerUrl = playerUrl
    resume_data.clothId = selectedClothId
    resume_data.token_id = tokenId
    sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  resume(data) {
    this.data = data
    this.battleState = new BattleState(data.battle_state)
    delete this.data['battle_state']
    setInterval(() => this.timer(), 1000)
    this.started = true
    this.keyManager = new ethers.Wallet(this.data.my_sk)
    console.log(this.battleState)
    if (this.battleState.sequence === 0) {
      document.getElementById('skill_box_temp').style.display = 'block'
      document.getElementById('wait_modal').style.display = 'none'

      document
        .getElementById('selectTypeBtn')
        .addEventListener('click', (e) => {
          console.log('버튼 클릭됨', selectedSkill, selectedDefenceSkills)
          if (selectedSkill.length < 3 || selectedDefenceSkills.length < 3) {
            alert('You have to choose 3 skills each.')
            return
          }
          document.getElementById('skill_box_temp').style.display = 'none'
          // 내 스킬타입 확정
          this.chooseAction({
            attacks: selectedSkill,
            defences: selectedDefenceSkills,
          })
        })
    } else {
      setBattleBackground(this.data.battleBackground)
      console.log(this.data)
      initBattle()
      animateBattle()
    }
  }

  getPlayerAction(index) {
    return this.battleState.player_skills[index][
      this.data.actions[index].action_index
    ]
  }

  chooseAction(action) {
    // if (this.data.pick_until_time < Date.now()) {
    //   window.alert('Time is Over.')
    //   return
    // }
    if (this.choseAction) {
      console.log('double click')
      return
    }
    this.choseAction = true
    if (this.battleState.sequence === 0) {
      this.data.actions[this.data.my_index] = {
        attacks: action.attacks,
        defences: action.defences,
        random_number: Math.floor(Math.random() * 1000000000),
      }
    } else {
      var skill = this.battleState.player_skills[this.data.my_index][action]
      if (!skill.check_availability(this.battleState.sequence)) {
        window.alert('skill is not allowed')
        this.choseAction = false
        return
      }
      this.data.actions[this.data.my_index] = {
        action_index: parseInt(action),
        random_number: Math.floor(Math.random() * 1000000000),
      }
    }
    this.sendCommit()
  }

  isMyAttack() {
    return this.battleState.attacker_index === this.data.my_index
  }

  async endBattle() {
    // var my_index = this.data.my_index
    // // player win
    // if (this.battleState.winner === my_index)
    //   await wallet.callMethod({
    //     contractId: BATTLE_CONTRACT,
    //     method: 'close_channel',
    //     args: {
    //       battle_id: this.data.battleId,
    //     },
    //     deposit: 1,
    //   })
    // sessionStorage.removeItem('resume-data')
  }

  timer() {
    if (this.data.mode === 'channel') this.onChannelHandler()
    else this.onChainHandler()
  }

  async onChannelHandler() {
    if (!this.data.status.isOk) return
    // if last consensused state is expired -> this moved to chain
    // if (this.data.oldBattleState.expires_at < Date.now()) {
    //   console.log(Date.now())
    //   this.data.mode = 'chain'
    //   return
    // }
    // console.log(this.data.oldBattleState.expires_at - Date.now())
    var msg = this.receiveQueue.shift()
    if (msg === undefined) return
    console.log(msg)
    if (this.data.status.stage === 'commit') {
      this.data.status.isOk = false
      this.receiveCommit(msg)
      this.data.status.stage = 'reveal'
    } else if (this.data.status.stage === 'reveal') {
      this.data.status.isOk = false
      await this.receiveAction(msg)
      this.data.status.stage = 'state'
    } else if (this.data.status.stage === 'state') {
      this.data.status.isOk = false
      await this.receiveStateSignature(msg)
      this.data.status.stage = 'commit'
    }

    // resume_data.battle_data = this.data
    // resume_data.playerUrl = playerUrl
    // resume_data.token_id = tokenId
    // sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  async onChainHandler() {
    setTimeout(() => {
      this.sendCommitForMultipleRoundsOnChain()
    }, 1000 * 60)
  }

  chooseMultipleActions(actions) {
    this.data.actions[this.data.my_index] = []
    actions.forEach((a) => {
      if (a.attacks !== undefined)
        this.data.actions[this.data.my_index].push({
          attacks: a.attacks,
          defences: a.defences,
          random_number: Math.floor(Math.random() * 1000000000),
        })
      else
        this.data.actions[this.data.my_index].push({
          action_index: parseInt(a),
          random_number: Math.floor(Math.random() * 1000000000),
        })
    })
  }

  async sendCommitForMultipleRoundsOnChain() {
    var commit = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        JSON.stringify(this.data.actions[this.data.my_index])
      )
    )
    var a = new Uint8Array([this.battleState.sequence])
    var b = ethers.utils.arrayify(commit)
    var message = new Uint8Array(a.length + b.length)
    message.set(a)
    message.set(b, a.length)
    var signature = await this.keyManager.signMessage(message)

    await wallet.callMethod({
      contractId: BATTLE_CONTRACT,
      method: 'commit',
      args: {
        battle_id: this.data.battleId,
        player_index: this.data.my_index,
        commit: commit,
        sig: signature,
      },
    })
    // send commit
    setTimeout(() => {
      this.sendActionForMultipleRoundsOnChain()
    }, 1000 * 60)
  }

  async sendActionForMultipleRoundsOnChain() {
    await wallet.callMethod({
      contractId: BATTLE_CONTRACT,
      method: 'reveal',
      args: {
        battle_id: this.data.battleId,
        player_index: this.data.my_index,
        action: this.data.actions[this.data.my_index],
      },
    })
  }

  async sendCommit() {
    console.log('send commit')
    var commit = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        JSON.stringify(this.data.actions[this.data.my_index])
      )
    )
    var a = new Uint8Array([this.battleState.sequence])
    var b = ethers.utils.arrayify(commit)
    var message = new Uint8Array(a.length + b.length)
    message.set(a)
    message.set(b, a.length)
    var signature = await this.keyManager.signMessage(message)
    if (this.battleState.sequence === 0)
      safe_send({
        BattleCommitReady: {
          battle_id: this.data.battleId,
          signature: signature,
          message: {
            hashed_message: commit,
            sequence: this.battleState.sequence,
          },
        },
      })
    else
      safe_send({
        BattleCommitAction: {
          battle_id: this.data.battleId,
          signature: signature,
          message: {
            hashed_message: commit,
            sequence: this.battleState.sequence,
          },
        },
      })
  }

  // channel only
  receiveCommit(commit) {
    console.log('receive commit')
    commit = JSON.parse(commit)
    var signature = commit.signature
    var a = new Uint8Array([this.battleState.sequence])
    var b = ethers.utils.arrayify(commit.hashed_message)
    var message = new Uint8Array(a.length + b.length)
    message.set(a)
    message.set(b, a.length)
    var addr = ethers.utils.verifyMessage(message, signature)
    var op_addr = ethers.utils.computeAddress('0x' + this.data.op_pk)
    if (addr === op_addr) {
      this.data.op_commit = commit.hashed_message
      this.data.op_commit_signature = signature
      this.sendAction()
      return
    } else {
      console.log('error receive commit')
      return
    }
  }

  async sendAction() {
    console.log('send action')
    var action = this.data.actions[this.data.my_index]
    console.log(action)
    if (this.battleState.sequence === 0)
      safe_send({
        BattleRevealReady: {
          battle_id: this.data.battleId,
          reveal_ready_message: action,
        },
      })
    else
      safe_send({
        BattleRevealAction: {
          battle_id: this.data.battleId,
          reveal_action_message: action,
        },
      })
  }

  // channel only
  async receiveAction(action) {
    console.log('receive action')
    action = JSON.parse(action)
    var commit = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(action))
    )
    if (commit === this.data.op_commit) {
      this.data.actions[1 - this.data.my_index] = action
      this.sendState()
      return
    } else {
      // temporary
      this.data.actions[1 - this.data.my_index] = action
      this.sendState()
      return
    }
  }

  // channel only
  async sendState() {
    console.log('send state')
    console.log(this.data.battleId)

    if (this.battleState.sequence === 0)
      this.battleState.setPlayerSkills(this.data.actions)
    else if (!this.battleState.doNext(this.data.actions)) {
      console.log('problem computing state')
      return false
    }
    var battleState = this.battleState.write()
    var message = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(battleState))
    )
    var signature = await this.keyManager.signMessage(message)
    signature = signature.substring(2)
    this.data.player_signatures[this.data.my_index] = signature
    console.log(this.data.battleId)
    safe_send({
      BattleConsensusState: {
        battle_id: this.data.battleId,
        state: battleState,
        consensus_signature: signature,
      },
    })
  }

  // chain only (query chain to get battle)
  async getBattle() {
    // var res = await wallet.viewMethod({
    //   contractId: BATTLE_CONTRACT,
    //   method: 'get_battle',
    //   args: { battle_id: this.data.battleId },
    // })
    // this.data.battleState = res.battle_state
    // // TODO
  }

  // channel only
  async receiveStateSignature(msg) {
    console.log('receive state signature')
    msg = JSON.parse(msg)
    // var signature = '0x' + this.data.manager_signature
    // console.log(signature)
    // var expires_at = msg.expires_at
    var expires_at = Date.now() + 10000
    this.data.pick_until_time = Date.now() + 59 * 1000

    this.data.player_signatures[1 - this.data.my_index] =
      msg.consensus_signature

    console.log(
      JSON.stringify({
        battle_id: this.data.battleId,
        state: this.battleState.write(),
        sig: [
          Buffer.from(this.data.player_signatures[0], 'hex').toString('base64'),
          Buffer.from(this.data.player_signatures[1], 'hex').toString('base64'),
        ],
        manager_sig: Buffer.from(this.data.manager_signature, 'hex').toString(
          'base64'
        ),
      })
    )

    // next state is valid only until 2.5 minute from now
    // if (!(expires_at < Date.now() + 150 * 1000)) return
    // if (!(expires_at < Date.now() + 1000 * 1000)) return
    var battleState = this.battleState.write()
    // var message = await ethers.utils.keccak256(
    //   ethers.utils.toUtf8Bytes(JSON.stringify(battleState))
    // )
    // var addr = ethers.utils.verifyMessage(message, signature)
    // var manager_addr = ethers.utils.computeAddress('0x' + this.data.manager_pk)
    // if (addr === manager_addr) {
    if (true) {
      //   this.data.manager_signature = signature
      this.data.oldBattleState = JSON.parse(JSON.stringify(battleState))
      this.choseAction = false
      if (this.battleState.sequence === 1) enterBattle()
      else {
        renderState(this.data, this.battleState)
        this.battleState.changeAttacker()
      }
      setUpNextSetting()
      this.save()
      return true
    } else {
      return false
    }
  }
}

export const battle = new BattleClient()
