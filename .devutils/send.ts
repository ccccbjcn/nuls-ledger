import 'babel-polyfill';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { broadcast, Coin, prepare_remark_tx, Transaction, write_with_length } from 'nulsworldjs';
import { NulsLedger } from '../src';
import { LedgerAccount } from '../src/LedgerAccount';

async function doStuff() {

  const bit        = await prepare_remark_tx('Nsdz1hZVPnMYZ3D2RzrA448Bdcot6Xia', 'Hello NULS from Ledger');
  const transport  = await TransportNodeHid.create();
  const nulsLedger = new NulsLedger(transport);
  const acct       = await nulsLedger.getPubKey(new LedgerAccount());
  bit.scriptSig    = null;

  const signature = await nulsLedger.signTX(new LedgerAccount(), bit.serialize());

  const pubKeyBuf = Buffer.from(acct.publicKey, 'hex');
  const scriptSig = Buffer.alloc(
    3
    + pubKeyBuf.length
    + signature.length
  );

  const ll = write_with_length(pubKeyBuf, scriptSig, 0);
  write_with_length(signature, scriptSig, ll + 1);

  bit.scriptSig = scriptSig;
  const txId    = await broadcast(bit.serialize().toString('hex'));
  console.log({ txId });
}

doStuff()
  .catch(console.log);
