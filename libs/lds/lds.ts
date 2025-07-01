import * as bitcoin from "bitcoinjs-lib";
import ecc from "./noble_ecc";
import { ECPairAPI, ECPairFactory } from "ecpair";
import BIP32Factory from "bip32";
import * as bip39 from "bip39";
import * as bitcoinMessage from "bitcoinjs-message";
import * as crypto from "crypto";

const ECPair: ECPairAPI = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);

export class LDS {
  private mnemonic: string;
  private passphrase: string;

  private derivationPath = "m/84'/0'/0'/0/0";
  private segwitType = "p2wpkh";
  private message = 'By_signing_this_message,_you_confirm_to_lightning.space_that_you_are_the_sole_owner_of_the_provided_Blockchain_address._Your_ID:_';
  private static ldsUrl = 'https://lightning.space/v1';

  private userCache: any;

  constructor(mnemonic: string, passphrase: string) {
    this.mnemonic = mnemonic;
    this.passphrase = passphrase;
  }

  getUniqueId() {
    const data = `${this.mnemonic.split(' ').join('')}-${this.passphrase}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  _getSeed(): Buffer {
    return bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
  }

  _getWIF() {
    const seed = this._getSeed();
    const root = bip32.fromSeed(seed);
    const child = root.derivePath(this.derivationPath);

    return child.toWIF();
  }

  getDerivationPath() {
    return this.derivationPath;
  }

  getSegwitType() {
    return this.segwitType;
  }

  getOnchainAssociatedAddress() {
    const wif = this._getWIF();
    const keyPair = ECPair.fromWIF(wif);
    const address = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
    }).address;

    return address;
  }

  sign(message: string) {
    const wif = this._getWIF();
    const keyPair = ECPair.fromWIF(wif);
    const privateKey = keyPair.privateKey;
    if (!privateKey) {
      throw new Error("Private key not found");
    }

    const options = {
      segwitType: this.segwitType,
    };

    const signature = bitcoinMessage.sign(
      message,
      Buffer.from(privateKey),
      keyPair.compressed,
      // @ts-ignore wth TS?
      options
    );

    return signature.toString("base64");
  }

  static async createSession(address: string, signature: string) {
    const data = {
      address,
      signature,
      wallet: 'DFX Bitcoin'
    };

    const { accessToken } = await fetch(`${LDS.ldsUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => res.json());

    return accessToken;
  }

  async getUser() {
    if (this.userCache) {
      return this.userCache;
    }

    const address = this.getOnchainAssociatedAddress() as string;
    const signature = this.sign(`${this.message}${address}`);
    const accessToken = await LDS.createSession(address, signature);

    const user = await fetch(`${LDS.ldsUrl}/user`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    }).then(res => res.json());

    this.userCache = user;

    return user;
  }
}