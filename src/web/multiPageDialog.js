export class MultiPageDialog {
  id
  constructor(id) {
    this.id = id
    var buttonContainer = document.createElement('div')
    buttonContainer.classList.add('buttonContainer')
    buttonContainer.id = id + 'ButtonContainer'
    document.getElementById(id + 'Card').appendChild(buttonContainer)

    var contentContainer = document.createElement('div')
    contentContainer.classList.add('contentContainer')
    contentContainer.id = id + 'Container'
    document.getElementById(id + 'Card').appendChild(contentContainer)
  }

  addPage(title, content) {
    var page = document.createElement('div')
    page.classList.add('page', this.id + 'Page')
    document.getElementById(this.id + 'Container').appendChild(page)

    var pageNumber = document.getElementsByClassName(this.id + 'Page').length
    console.log(pageNumber)

    var titleElement = document.createElement('h2')
    titleElement.innerText = title
    page.appendChild(titleElement)
    page.innerHTML += content

    var button = document.createElement('div')
    button.classList.add('pageBtn')
    button.innerText = pageNumber
    button.setAttribute('value', pageNumber - 1)

    document.getElementById(this.id + 'ButtonContainer').appendChild(button)

    button.addEventListener('click', (e) => {
      document.getElementById(this.id + 'Container').scrollTop =
        350 * e.currentTarget.getAttribute('value')
    })
  }
}

const guidanceCard = new MultiPageDialog('guidance')
guidanceCard.addPage(
  'AI Born from, Owned by Solana Community',
  `<p>This is a visual demo for SolAI Scheme</p>
  <p>Train and Own </p>
<p>You can walk, and interact with the Octopus.</p>
<p>Move to Next Page!</p>`
)

guidanceCard.addPage(
  'Control',
  `<p>Move with keyboard 'w,a,s,d'</p>
<p>Read what Octopus is Speaking and Click Objects as guided!</p>
<p>Move to Next Page!</p>`
)

guidanceCard.addPage(
  'Receive the ownership share of the global model!',
  `<p>Participate to Training, Own The AI</p>
  <p>Move and Click Octopus to Participate!</p>
  <p>Move to Next Page!</p>`
)

guidanceCard.addPage(
  'Training Task: Health Data → Solana Price',
  `<p>Let's Train an Octopus that predicts Solana Price</p>
<p>
  Octopus will use Solana Community's Health Data in prediction!
</p>
<p>Will the octopus able to learn and find something?</p>
<p>Let's Find Out!</p>
<p>Move to Next Page!</p>`
)

guidanceCard.addPage(
  'Prepare your Apple Health Data',
  `<p>Export Data on Your Iphone!</p>
<p>The file name will be "export.zip"</p>
<p>Octopus will request to train with this Health Data</p>
<button id="closeGuidanceBtn">Close</button>`
)

document.getElementById('closeGuidanceBtn').addEventListener('click', (e) => {
  document.getElementById('guidanceCard').style.display = 'none'
})

const waitingCard = new MultiPageDialog('waiting')
waitingCard.addPage(
  'Thank you for your participation!',
  `<p>This is a visual demo for SolAI Scheme</p>
<p>We will introduce what we are doing!</p>
<p>Move to Next Page!</p>`
)

waitingCard.addPage(
  'Training Task: Health Data → Solana Price',
  `<p>Let's Train an Octopus that predicts Solana Price</p>
<p>
  Octopus will use Solana Community's Health Data in prediction!
</p>
<p>Will the octopus able to learn and find something?</p>
<p>Let's Find Out!</p>
<p>Move to Next Page!</p>`
)

waitingCard.addPage(
  'What Happens after Training is Done?',
  `<p>You will receive a NFT representing your ownership of this trained model</p>
  <img src="https://raw.githubusercontent.com/Community-Driven-AI/.github/main/solai.png" style="height:150px; width:150px;"/>
  <p>You Will Later Receive The Stake of the Global Model!</p>
  <button id="closeWaitingCard">Close</button>`
)

document.getElementById('closeWaitingCard').addEventListener('click', (e) => {
  document.getElementById('waitingCard').style.display = 'none'
})