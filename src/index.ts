import { DposLedger, ILedgerAccount } from 'dpos-ledger-api';
import { LedgerAccount } from './LedgerAccount';

export class NulsLedger extends DposLedger {

  public async getPubKey(account: ILedgerAccount | Buffer, showOnLedger?: boolean): Promise<{ publicKey: string; address: string, chainCode: string }> {
    const pathBuf = Buffer.isBuffer(account) ? account : account.derivePath();
    const resp    = await this.exchange([
      0x04,
      showOnLedger ? 0x1 : 0x0,
      0x01,
      (pathBuf.length / 4),
      pathBuf,
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
    account: ILedgerAccount | Buffer,
    buff: Buffer): Promise<Buffer> {

    const acctBuf = ! Buffer.isBuffer(account) ? account.derivePath() : account;
    const buffLength = new Buffer(2);

    buffLength.writeUInt16BE(buff.length, 0);
    const args        = await this.exchange([
      signType, // sign
      0x1, // address type.
      // Bip32
      (acctBuf.length / 4),
      acctBuf,
      // headers
      buffLength,
      // data
      buff,
    ]);
    const [signature] = args;
    return signature;
  }
}
