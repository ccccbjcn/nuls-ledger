import { CommHandler } from 'dpos-ledger-api';
import { ITransport } from 'dpos-ledger-api/src/ledger';

export class NulsCommHandler extends CommHandler {
  constructor(transport: ITransport, chunkSize: number = 240) {
    super(transport, chunkSize);
    transport.setScrambleKey('NULS');
  }

  protected prepareStartCommBufferContent(inputBuffer: Buffer): Buffer {
    // super method only writes 2 bytes.
    const buff = Buffer.alloc(4);
    buff.writeUInt32LE(inputBuffer.length, 0);
    return buff;
  }
}