import { login } from '../user/logIn'
import { wallet } from '../wallet/multi-wallet'
import { player } from '../user/user'
import { FixedObject, fixedObjects } from '../object/FixedObject'

const files = []

function addBtnClickEvent(btnID, func) {
  document.getElementById(btnID).addEventListener('click', func)
}

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
        files.push(file)
        document.getElementById('drop_zone').innerHTML += `<p>${file.name}<\p>`
      }
    })
  } else {
    // Use DataTransfer interface to access the file(s)
    ;[...e.dataTransfer.files].forEach((file, i) => {
      files.push(file)
      document.getElementById('drop_zone').innerHTML += `<p>${file.name}<\p>`
    })
  }
}

document.getElementById('evaluate_drop_zone').ondrop = (e) => {
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
        files.push(file)
        document.getElementById(
          'evaluate_drop_zone'
        ).innerHTML += `<p>${file.name}<\p>`
      }
    })
  } else {
    // Use DataTransfer interface to access the file(s)
    ;[...e.dataTransfer.files].forEach((file, i) => {
      files.push(file)
      document.getElementById(
        'evaluate_drop_zone'
      ).innerHTML += `<p>${file.name}<\p>`
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

document.getElementById('evaluate_drop_zone').ondragover = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

document.getElementById('evaluate_drop_zone').ondragenter = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

addBtnClickEvent('closeCardBtn', (e) => {
  document.getElementById('drop_modal').style.display = 'none'
})

addBtnClickEvent('closeEvaluateCardBtn', (e) => {
  document.getElementById('evaluate_drop_modal').style.display = 'none'
})

addBtnClickEvent('uploadBtn', (e) => {
  document.getElementById('upload_model_modal').style.display = 'none'
  document.getElementById('uploadingCard').style.display = 'block'
  setTimeout(() => {
    document.getElementById('uploadingCard').style.display = 'none'
    document.getElementById('uploadDoneCard').style.display = 'block'
  }, 5 * 1000)
})

addBtnClickEvent('downloadBtn', (e) => {
  fixedObjects['tower'].clickable = false
  fixedObjects['buildArea'].msgs = ['Drop Model Here!']
  fixedObjects['tower'].msgs = []
  fixedObjects['buildArea'].clickable = true
  fixedObjects['tower'].clickEvent = () => {
    document.getElementById('upload_model_modal').style.display = 'block'
    fixedObjects['tower'].msgs = []
  }
  player.holdItem('../img/single_octopus.png')
  document.getElementById('download_modal').style.display = 'none'
})

fixedObjects['localModel1'].msgs = ['Click to Evaluate This Model!']
fixedObjects['localModel1'].clickable = true
fixedObjects['localModel1'].clickEvent = () => {
  document.getElementById('evaluate_drop_modal').style.display = 'block'
}

// document.getElementById('drop_modal').style.display = 'block'
let evaluateCheckIntervalId
addBtnClickEvent('evaluateBtn', (e) => {
  if (files.length !== 1) {
    window.alert('please attach 1 file')
    return
  }
  fixedObjects['localModel1'].clickable = false
  fixedObjects['localModel1'].msgs = ['Setting up Evaluation...']
  document.getElementById('evaluate_drop_modal').style.display = 'none'

  var file = files[0]
  var formData = new FormData()
  formData.append('file', file)
  formData.append('client_address', wallet.getAccountId())

  var xhr = new XMLHttpRequest()
  xhr.open('POST', 'https://tmp.web3mon.io/evaluate-model')
  xhr.onload = function () {
    console.log(xhr.response)
    if (xhr.status === 200) {
      if (xhr.response === 'Already Doing Task') {
        window.alert('Already Doing Task')
        location.reload()
        return
      }
      files.length = 0
      fixedObjects['localModel1'].msgs = ['Started Evaluating...']
      fixedObjects['localModel1'].clickable = false
      fixedObjects['localModel1'].sprite.animate = true
      evaluateCheckIntervalId = setInterval(() => {
        const url = new URL('https://tmp.web3mon.io/check-done') // Replace with the URL you want to request
        url.searchParams.append('client_address', wallet.getAccountId())
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            if (data === 'success') {
              window.alert('Evlauation Success!')
              fixedObjects['localModel1'].msgs = ['Evaluation Done!']
              clearInterval(evaluateCheckIntervalId)
              fixedObjects['localModel1'].clickable = true
              fixedObjects['localModel1'].sprite.animate = false
              fixedObjects['localModel1'].clickEvent = () => {
                document.getElementById('endEvaluateCard').style.display = 'block'
                setTimeout(() => {
                  document.getElementById('endEvaluateCard').style.display = 'none'
                }, 5 * 1000)
              }
              // Handle the response here
              console.log(data)
            }
            else if (data === 'failed') {
              document.getElementById('errorCard').style.display = 'block'
            }
          })
          .catch((error) => {
            // Handle any errors here
            console.error(error)
          })
      }, 30 * 1000)
    } else {
      alert('Failed to train file, Refresh Screen Please')
    }
  }
  xhr.send(formData)
})

// document.getElementById('drop_modal').style.display = 'block'
let trainCheckIntervalId
addBtnClickEvent('trainBtn', (e) => {
  if (files.length !== 1) {
    window.alert('please attach 1 file')
    return
  }
  fixedObjects['localModel'].sprite.animate = true
  fixedObjects['localModel'].clickable = false
  fixedObjects['buildArea'].msgs = ['Setting Local Training...']
  document.getElementById('drop_modal').style.display = 'none'

  var file = files[0]
  var formData = new FormData()
  formData.append('file', file)
  formData.append('client_address', wallet.getAccountId())

  var xhr = new XMLHttpRequest()
  xhr.open('POST', 'https://tmp.web3mon.io/local-train')
  xhr.onload = function () {
    files.length = 0

    console.log(xhr.response)
    if (xhr.status === 200) {
      if (xhr.response === 'Already Doing Task') {
        window.alert('Already Doing Task')
        location.reload()
        return
      }
      document.getElementById('waitingCard').style.display = 'block'
      fixedObjects['buildArea'].msgs = [
        'Started Local Training...',
        'Building your Local Model...',
        'Estimated Time: ~3 minutes',
      ]
      trainCheckIntervalId = setInterval(() => {
        console.log('here')
        const url = new URL('https://tmp.web3mon.io/check-done') // Replace with the URL you want to request
        url.searchParams.append('client_address', wallet.getAccountId())
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            if (data === 'success') {
              fixedObjects['buildArea'].msgs = [
                'Local Training Done!',
                'Click to Receive Local Model',
              ]
              clearInterval(trainCheckIntervalId)
              fixedObjects['localModel'].sprite.animate = false
              fixedObjects['localModel'].clickable = true
              fixedObjects['localModel'].clickEvent = () => {
                player.holdItem('../img/single_octopus.png')
                delete fixedObjects['localModel']
                fixedObjects['buildArea'].msgs = [
                  'Check if you have Received AI NFT',
                  'Click the Blue Area to register model',
                ]
                fixedObjects['evaluateArea'].clickable = true
                fixedObjects['evaluateArea'].clickEvent = () => {
                  fixedObjects['evaluateArea'].clickable = false
                  player.dropItem()
                  document.getElementById('uploadDoneCard').style.display =
                    'block'
                  setTimeout(() => {
                    document.getElementById('uploadDoneCard').style.display =
                      'none'
                  }, 5 * 1000)
                  var localModel = new FixedObject(
                    'localModel',
                    'BATTLE0',
                    'MY LOCAL MODEL',
                    [1850, 1300],
                    {
                      max: 17,
                      hold: 10,
                    },
                    []
                  )
                  var localModelImage = new Image()
                  localModelImage.src = '../img/octopus.png'
                  localModel.sprite.setImage(localModelImage)
                  localModel.sprite.setScale(0.7)
                  fixedObjects['localModel3'] = localModel
                }
              }
              document.getElementById('endTrainCard').style.display = 'block'
              setTimeout(() => {
                document.getElementById('endTrainCard').style.display = 'none'
              }, 5 * 1000)
            }
            if (data === 'failed') {
              window.alert('wrong Data Format')
              location.reload()
            }
          })
          .catch((error) => {
            // Handle any errors here
            console.error(error)
          })
      }, 30 * 1000)
    } else {
      alert('Failed to train file, Refresh Screen Please')
    }
  }
  xhr.send(formData)
})