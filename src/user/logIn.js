import { wallet } from '../wallet/multi-wallet'
import { connect } from '../network/websocket'
import { User, users } from './user'
import { adjustMapPosition, transferMapTo } from '../control/map'
import { animate } from '../animate'

export let playerUrl
export let tokenId
export let selectedClothId
export let collection

function truncate(input, length) {
  if (input.length > length) {
    return input.substring(0, length) + '...'
  }
  return input
}

export function setNFTInfo(nft_collection, nft_tokenId) {
  tokenId = nft_tokenId
  collection = nft_collection
}

export function setPlayerUrl(url) {
  playerUrl = url
}

export function setClothId(id) {
  selectedClothId = id
}

export const login = async () => {
  turnToGameScreen()
}

/**
 * 메인화면을 display:none 처리하고, 게임화면을 display:block 한다.
 */
export const turnToGameScreen = () => {
  document.getElementById('login_screen').style.display = 'none'
  document.getElementById('game_screen').style.display = 'block'
  document.querySelector('canvas').style.display = 'block'

  var newUser = new User('myID', 'MAIN', 'ME!', [0, 0])
  newUser.setSpriteImages('up', '../img/character/up.png')
  newUser.setSpriteImages('down', '../img/character/down.png')
  newUser.setSpriteImages('right', '../img/character/right.png')
  newUser.setSpriteImages('left', '../img/character/left.png')

  users['myID'] = newUser

  adjustMapPosition()
  document.getElementById('loading').style.display = 'none'
  document.getElementById('guidanceCard').style.display = 'block'
  animate()
  transferMapTo('BATTLE0')
}

export const logout = () => {
  wallet.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}
