import { LedgerAccount } from './LedgerAccount';
import { NulsCommHandler } from './NulsCommHandler';

export { NulsCommHandler };
export { LedgerAccount };

export class NulsLedger  {
  /**
   * @param {CommHandler} commHandler communication handler
   */
  constructor(private commHandler: NulsCommHandler) {
  }
  /**
   * Signs a message. The message can be passed as a string or buffer.
   * Note that if buffer contains "non-printable" characters, then the ledger will probably have some issues
   * Displaying the message to the user.
   * @param {LedgerAccount | Buffer} account or raw bip32 buffer
   * @param {string | Buffer} what the message to sign
   * @returns {Promise<Buffer>} the "non-detached" signature.
   * Signature goodness can be verified using sodium. See tests.
   * @example
   * ```javascript
   *
   * instance.signMSG(account, 'vekexasia rules', false)
   *   .then((signature) => {
   *     console.log('Signature is: ', signature.toString('hex'));
   *   });
   * ```
   */
  public async signMSG(account: LedgerAccount, what: string | Buffer): Promise<Buffer> {
    const buffer: Buffer = typeof(what) === 'string' ? new Buffer(what, 'utf8') : what;
    const [signature] = await this.commHandler.exchange([
      0x06,
      account.toExchangeBuff(),
      0x00, // no change
      buffer,
    ]);
    return signature;
  }

  /**
   * Signs a transaction. Transaction must be provided as a buffer
   * @param {LedgerAccount} fromAccount the account you want to sign from
   * @param {LedgerAccount} changeAccount the account you want to send change to
   * @param {Buffer} tx the binary raw representation of the tx.
   * @returns {Promise<Buffer>} signature.
   * @example
   * ```javascript
   *
   * instance.signTX(account, transaction.getBytes(), false)
   *   .then((signature) => {
   *     console.log('Signature is: ', signature.toString('hex'));
   *   });
   * ```
   */
  public async signTx(fromAccount: LedgerAccount, changeAccount: LedgerAccount, tx: Buffer): Promise<Buffer> {
    const buffLength = new Buffer(4);
    buffLength.writeUInt32BE(tx.length, 0);
    const [signature] = await this.commHandler.exchange([
      0x05,
      fromAccount.toExchangeBuff(),
      changeAccount ? changeAccount.toExchangeBuff() : 0x00,
      buffLength,
      tx,
    ]);
    return signature;
  }

  /**
   * Gets Ledger App Version
   * @returns {Promise<object>} see example
   * @example
   * ```javascript
   *
   * instance.version()
   *   .then((resp) => {
   *     console.log('CoinID is: ', resp.coinID);
   *     console.log('Version is: ', resp.version);
   *   });
   * ```
   */
  public async version(): Promise<{ version: string, coinID: string }> {
    const [version, coinID] = await this.commHandler.exchange(0x09);
    return {
      coinID : coinID.toString('ascii'),
      version: version.toString('ascii'),
    };
  }
  /**
   * Simple ping utility. It won't throw if ping suceeded.
   * @returns {Promise<void>}
   */
  public async ping(): Promise<void> {
    const [res] = await this.commHandler.exchange(0x08);
    if (res.toString('ascii') !== 'PONG') {
      throw new Error('Didnt receive PONG');
    }
  }

  public async getPubKey(account: LedgerAccount, showOnLedger?: boolean): Promise<{ publicKey: string; address: string, chainCode: string }> {
    const resp    = await this.commHandler.exchange([
      0x04,
      showOnLedger ? 0x1 : 0x0,
      account.toExchangeBuff(),
    ]);

    const [chainCode, publicKey, address] = resp;

    return {
      address  : address.toString('utf8'),
      chainCode: chainCode.toString('hex'),
      publicKey: publicKey.toString('hex'),
    };
  }

  protected async sign(
    signType: number,
    accountFrom: LedgerAccount,
    accountChange: LedgerAccount,
    buff: Buffer): Promise<Buffer> {

    const buffLength = new Buffer(4);

    buffLength.writeUInt32BE(buff.length, 0);
    const args        = await this.commHandler.exchange([
      signType, // sign
      0x1, // address type.
      accountFrom.toExchangeBuff(),
      accountChange ? accountChange.toExchangeBuff() : Buffer.alloc(1).fill(0x00),
      // headers
      buffLength,
      // data
      buff,
    ]);
    const [signature] = args;
    return signature;
  }
}
