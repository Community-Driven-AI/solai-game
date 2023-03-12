/* A helper file that simplifies using the wallet selector */

// near api js
import { clusterApiUrl } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  PhantomWalletAdapter,
  SolletExtensionWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { wallet } from './multi-wallet'

const THREEHUN_TGAS = '300000000000000'
const NO_DEPOSIT = '0'

// Wallet that simplifies using the wallet selector
export class SolanaWallet {
  connection
  wallets
  wallet
  network
  createAccessKeyFor
  accountId

  constructor() {
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    this.wallets = [
      new PhantomWalletAdapter(),
      new SolletExtensionWalletAdapter(),
    ]
    const container = document.getElementById('nearWallets')
    for (var i = 0; i < this.wallets.length; i++) {
      console.log(this.wallets[i])
      if (this.wallets[i].readyState === 'Installed') {
        var button = document.createElement('button')
        button.className = 'one_collection'
        button.innerHTML = `<div class="img_outer"><img src=${this.wallets[i].icon}></div><div class="collection_name">${this.wallets[i].name}</div>`
        button.setAttribute('value', i)
        button.addEventListener('click', (e) => {
          var index = e.currentTarget.getAttribute('value')
          this.wallets[index].connect().then(() => {
            wallet.selectedChain = 'SOLANA'
            this.wallet = this.wallets[index]
            this.accountId = this.wallet.publicKey
            wallet.signIn()
            document.querySelector('#enterBtn').style.display = 'block'
            document.querySelector('#sign_out').style.display = 'block'
          })
        })
        container.append(button)
      }
    }
  }

  // To be called when the website loads
  async startUp() {
    this.walletSelector = await setupWalletSelector({
      network: this.network,
      modules: [
        setupNearWallet(),
        setupMeteorWallet({ iconUrl: meteorIconUrl }),
      ],
    })

    if (isSignedIn) {
      this.wallet = await this.walletSelector.wallet()
      this.accountId =
        this.walletSelector.store.getState().accounts[0].accountId
      wallet.selectedChain = 'NEAR'
      document.querySelector('#enterBtn').style.display = 'block'
      document.querySelector('#sign_out').style.display = 'block'
      wallet.signIn()
    }
    this.setUpSignInModal()
    document.querySelector('#start_login_button').removeAttribute('disabled')
    return isSignedIn
  }

  // Sign-in method
  setUpSignInModal() {
    const description = 'Please select a wallet to sign in.'
    const modal = setupModal(this.walletSelector, {
      contractId: this.createAccessKeyFor,
      description,
    })
    modal.show()
    document
      .querySelector('#nearWallets')
      .insertBefore(
        document.querySelector('#near-wallet-selector-modal'),
        undefined
      )
    document.getElementsByClassName('modal-right')[0].innerHTML = ''
    document.getElementsByClassName('modal-left-title')[0].remove()
    const elements = document.getElementsByClassName('description')
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0])
    }
  }

  // Sign-out method
  signOut() {
    this.wallet.disconnect().then(() => {
      location.reload()
    })
  }

  // Make a read-only call to retrieve information from the network
  async viewMethod({ contractId, method, args = {} }) {
    const { network } = this.walletSelector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    })
    return JSON.parse(Buffer.from(res.result).toString())
  }

  // Call a method that changes the contract's state
  async callMethod({
    contractId,
    method,
    args = {},
    gas = THREEHUN_TGAS,
    deposit = NO_DEPOSIT,
  }) {
    // Sign a transaction with the "FunctionCall" action
    const outcome = await this.wallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    })

    return providers.getTransactionLastResult(outcome)
  }

  async verifyOwner(collection, tokenId, clothId) {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore()
    const keyPair = await keyStore.getKey(this.network, this.accountId) // w

    let msg = {
      chain: 'NEAR',
      collection: collection,
      token_id: tokenId,
      pub_key: Buffer.from(keyPair.publicKey.data).toString('hex'),
      extra_info: {
        near_account_id: this.accountId,
      },
      clothes_nft_id: clothId,
    }
    var hash_msg = JSON.stringify(msg)
    // var hash = sha256.create()
    // hash.update(hash_msg)
    // hash_msg = hash.hex()
    hash_msg = await ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes(hash_msg))
      .substring(2)
    var signature = keyPair.sign(Buffer.from(hash_msg))
    const body = {
      signature: Buffer.from(signature.signature).toString('hex'),
      message: msg,
    }
    console.log(JSON.stringify(body))

    var res = await axios.post(
      'http://ec2-44-201-5-87.compute-1.amazonaws.com:8080/login',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('답 ', res)
    if (res.data.jwt !== undefined) {
      sessionStorage.setItem('jwt', res.data.jwt)
      return true
    } else return false
  }

  // Get transaction result from the network
  async getTransactionResult(txhash) {
    const { network } = this.walletSelector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused')
    return providers.getTransactionLastResult(transaction)
  }
}
