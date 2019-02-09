import * as bip32path from 'bip32-path';

export enum SupportedCoin {
  NULS     = 8964,
  NULSTEST = 261,
}

/**
 * Defines an Account to be used when communicating with ledger
 */
export class LedgerAccount {
  // tslint:disable variable-name
  private _account: number          = 0;
  private _index: number            = 0;
  private _change: boolean          = false;
  private _coinIndex: SupportedCoin = SupportedCoin.NULS;

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
      this._change ? '1' : '0',
      this._index,
    ].join('/');

    const pathArray: number[] = bip32path.fromString(path)
      .toPathArray();

    const retBuf = Buffer.alloc(pathArray.length * 4);
    pathArray.forEach((r, idx) => retBuf.writeUInt32BE(r, idx * 4));
    return retBuf;
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
