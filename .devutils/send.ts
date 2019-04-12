import 'babel-polyfill';
import * as shajs from 'sha.js';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import { broadcast, Coin, prepare_remark_tx, Transaction, write_with_length } from 'nulsworldjs';
import { LedgerAccount, NulsCommHandler, NulsLedger } from '../src';

async function doStuff() {

  const bit        = await prepare_remark_tx('Nse2dqgEWLUqxe51K5rwj3Gq2ukHGTAz', 'Hello NULS from Ledger');
  const transport  = await TransportNodeHid.create();
  const commHandler = new NulsCommHandler(transport);
  const nulsLedger = new NulsLedger(commHandler);
  const mainAcct   = new LedgerAccount();
  const changeAcct = new LedgerAccount(); //.change(true);
  const acct       = await nulsLedger.getPubKey(mainAcct);
  console.log(bit);
  console.log(acct);
  bit.scriptSig    = null;

  const msgToSign = bit.serialize();
  console.log('RAWTX\t', msgToSign.toString('hex'));
  const signature = await nulsLedger.signTx(mainAcct, changeAcct, msgToSign);

  const pubKeyBuf = Buffer.from(acct.publicKey, 'hex');
  const scriptSig = Buffer.alloc(
    3
    + pubKeyBuf.length
    + signature.length
  );

  const ll = write_with_length(pubKeyBuf, scriptSig, 0);
  write_with_length(signature, scriptSig, ll + 1);

  bit.scriptSig = scriptSig;

  console.log('SIGNED\t', bit.serialize().toString('hex'));
  console.log('SIGNATURE\t', signature.toString('hex'), signature.length);
  const digest = shajs('sha256').update(msgToSign).digest();
  console.log('DIGEST\t', digest.toString('hex'));
  const txId    = await broadcast(bit.serialize().toString('hex'));
  console.log({ txId });

}

doStuff()
  .catch(console.log);
