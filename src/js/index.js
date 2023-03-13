// 최초로 지갑 연결
// connectWallets(nearAPI)

export let stopAllPlay = false
export const setStopAllPlay = (bol) => {
  stopAllPlay = bol
}

export const canvas = document.querySelector('canvas')

const body = document.querySelector('body')

body.addEventListener('keydown', (event) => {
  if (document.getElementById('chatForm').style.display !== 'none') {
    return
  }
})

export const canva = canvas.getContext('2d')
canva.textAlign = 'center'

export const offset = {
  x: window.innerWidth / 2 - 3360 / 2,
  y: window.innerHeight / 2 - 1920 / 2,
}