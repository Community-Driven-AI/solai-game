import { NearWallet } from './near-wallet'
import { SolanaWallet } from './solana-wallet'
import { PolygonWallet } from './polygon-wallet'
import { TerraWallet } from './terra-wallet'

class MultiWallet {
  wallets
  selectedChain

  constructor() {
    this.wallets = {}
    this.wallets['NEAR'] = new NearWallet({
      createAccessKeyFor: 'web3mon.testnet',
      network: 'testnet',
    })
  }

  startUp() {
    document.querySelector('#start_login_button').removeAttribute('disabled')

    // this.wallets['NEAR'].startUp()
  }

  getAccountId() {
    if (this.selectedChain === undefined) return ''
    return this.wallets[this.selectedChain].accountId
  }

  signIn() {
    if (this.wallets['SOLANA'] === undefined)
      this.wallets['SOLANA'] = new SolanaWallet()
    if (this.getAccountId() !== undefined)
      document.getElementById('loggedInWith').innerText = this.getAccountId()
    document.getElementById('connect_modal_box').style.display = 'flex'
  }

  signOut() {
    this.wallets[this.selectedChain].signOut()
  }

  async viewMethod(kargs) {
    return await this.wallets[this.selectedChain].viewMethod(kargs)
  }

  async callMethod(kargs) {
    return await this.wallets[this.selectedChain].callMethod(kargs)
  }

  async verifyOwner(collection, token_id, cloth_id) {
    console.log(this.selectedChain)
    return await this.wallets[this.selectedChain].verifyOwner(
      collection,
      token_id,
      cloth_id
    )
  }
}

export const wallet = new MultiWallet()
wallet.startUp()
