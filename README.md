# NULS Ledger API

This TypeScript/JavaScript library is meant to be used with the hardware wallet implementation. This library will serve as an API wrapper to communicate with the corresponding C Implementation.

## Environment

This library should work both when consuming it in Node.JS and Browser environment as no specific env assumptions were made during the implementation

## Using the library

**Step 1**: define transport

First we need to instantiate the proper transport. Transport classes are provided directly from Ledger.

Browser Transport: 
```js
import Transport from '@ledgerhq/hw-transport-u2f';
```

Node.js Transport:
```js
import Transport from '@ledgerhq/hw-transport-node-hid';
```


**Step 2**: create transport

Once the transport class has been imported, just create an instance of it using the `.create` static method like so:

```js
Transport.create()
  .then((transportInstance) => {/*...*/});
```

**Step 3**: Feed transport into the commHandler

```js
import { CommHandler } from 'nuls-ledger';


Transport.create()
  .then((transportInstance) => new CommHandler(transportInstance))
  .then((commHandler) => {/*...*/})

```

**Step 4**: Feed the commHandler instance into the library main class

```js
import { CommHandler, NulsLedger } from 'nuls-ledger';


Transport.create()
  .then((transportInstance) => new CommHandler(transportInstance))
  .then((commHandler) => new NulsLedger(commHandler))
  .then((nulsLedger) => {/**
  
  Actual code
  **/})

```


## Library Methods

This library, which serves as an API wrapper, does not provide any functionality to serialize or deserialize the object that needs to be signed.

Once `nulsLedger` instance has been created, you can use one of the following methods:

 - `signTx(fromAccount: LedgerAccount, changeAccount: LedgerAccount, tx: Buffer)`
 - `signMSG(account: LedgerAccount, what: string | Buffer)`
 - `version()`
 - `ping()`
 
All methods above returns a Promise and could be used with ES6 async/await feature.




