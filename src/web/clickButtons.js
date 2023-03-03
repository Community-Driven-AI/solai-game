import { login } from '../user/logIn'
import * as nearAPI from 'near-api-js'
import { findMyNFT } from '../user/findNFT'
import { wallet } from '../wallet/multi-wallet'
import { player } from '../user/user'
import { fixedObjects } from '../object/FixedObject'

const files = []

function addBtnClickEvent(btnID, func) {
  document.getElementById(btnID).addEventListener('click', func)
}

addBtnClickEvent('closeResultBtn', (e) => {
  document.getElementById('battleResultCard').style.display = 'none'
})

addBtnClickEvent('enterBtn', (e) => {
  login()
})

addBtnClickEvent('start_login_button', (e) => {
  wallet.signIn()
})

addBtnClickEvent('sign_out', (e) => {
  wallet.signOut()
})

document.getElementById('drop_zone').ondrop = (e) => {
  e.stopPropagation()
  e.preventDefault()
  if (files.length !== 0) {
    window.alert('please attach 1 file')
    return
  }

  if (e.dataTransfer.items) {
    ;[...e.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile()
        files.push(file.name)
        document.getElementById('drop_zone').innerHTML += `<p>${file.name}<\p>`
      }
    })
  } else {
    // Use DataTransfer interface to access the file(s)
    ;[...e.dataTransfer.files].forEach((file, i) => {
      files.push(file.name)
      document.getElementById('drop_zone').innerHTML += `<p>${file.name}<\p>`
    })
  }
}

document.getElementById('drop_zone').ondragover = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

document.getElementById('drop_zone').ondragenter = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

addBtnClickEvent('closeCardBtn', (e) => {
  document.getElementById('drop_modal').style.display = 'none'
})

addBtnClickEvent('trainBtn', (e) => {
  if (files.length !== 1) {
    window.alert('please attach 1 file')
    return
  }
  fixedObjects['tower'].sprite.animate = true
  fixedObjects['tower'].msgs = ['Commiting Training...', 'Upgrading...']
  document.getElementById('drop_modal').style.display = 'none'

  setTimeout(() => {
    files.length = 0
    fixedObjects['tower'].msgs = ['Local Training Done!', 'Sending 10 SolAI...']
    fixedObjects['tower'].sprite.animate = false
    document.getElementById('endTrainCard').style.display = 'block'
    setTimeout(() => {
      document.getElementById('endTrainCard').style.display = 'none'
    }, 5 * 1000)
  }, 10 * 1000)
})

const guideBtns = document.getElementsByClassName('guideBtn')
for (let i = 0; i < guideBtns.length; i++) {
  guideBtns.item(i).addEventListener('click', (e) => {
    const ee = document.getElementById('guideContainer')
    ee.scrollTop = 360 * i
  })
}
