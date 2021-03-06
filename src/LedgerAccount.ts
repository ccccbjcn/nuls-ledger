import * as bip32path from 'bip32-path';

export enum SupportedCoin {
  NULS     = 1,
  NULSTEST = 261,
}

export type AddressType = 0x1 | 0x2 | 0x3;
/**
 * Defines an Account to be used when communicating with ledger
 */
export class LedgerAccount {
  // tslint:disable variable-name
  private _account: number          = 0;
  private _index: number            = 0;
  private _change: boolean          = false;
  private _coinIndex: SupportedCoin = SupportedCoin.NULS;
  private _addressType: AddressType = 0x1;

  public get addressType() {
    return this._addressType;
  }

  public set addressType(addressType: AddressType) {
    this._addressType = addressType;
  }
  // tslint:enable variable-name

  /**
   * Specify the account number
   * @param {number} newAccount
   * @returns {this}
   */
  public account(newAccount: number): this {
    this.assertValidPath(newAccount);
    this._account = newAccount;
    return this;
  }

  public change(isChangeAddr: boolean = true): this {
    this._change = isChangeAddr;
    return this;
  }

  public index(acctIndex: number): this {
    this.assertValidPath(acctIndex);
    this._index = acctIndex;
    return this;
  }

  /**
   * Specify the coin index.
   * @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
   * @param {number} newIndex
   * @returns {this}
   */
  public coinIndex(newIndex: SupportedCoin): this {
    this.assertValidPath(newIndex);
    this._coinIndex = newIndex;
    return this;
  }

  /**
   * Derive the path using hardened entries.
   * @returns {Buffer} defines the path in buffer form.
   */
  public derivePath(): Buffer {
    const path = [
      '44h',
      `${this._coinIndex}h`,
      `${this._account}h`,
      this._change ? '1h' : '0h',
      `${this._index}h`,
    ].join('/');

    const pathArray: number[] = bip32path.fromString(path)
      .toPathArray();

    const retBuf = Buffer.alloc(pathArray.length * 4);
    pathArray.forEach((r, idx) => retBuf.writeUInt32BE(r, idx * 4));
    return retBuf;
  }

  public toExchangeBuff() {
    const path = this.derivePath();
    return Buffer.concat([
      Buffer.alloc(1).fill(path.length / 4),
      Buffer.alloc(1).fill(this.addressType),
      path,
    ]);
  }

  /**
   * Asserts that the given param is a valid path (integer > 0)
   */
  private assertValidPath(n: number) {
    if (!Number.isInteger(n)) {
      throw new Error('Param must be an integer');
    }
    if (n < 0) {
      throw new Error('Param must be greater than zero');
    }
  }
}
