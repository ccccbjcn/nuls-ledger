import { CommHandler } from 'dpos-ledger-api';

export class NulsCommHandler extends CommHandler {
  protected prepareStartCommBufferContent(inputBuffer: Buffer): Buffer {
    // super method only writes 2 bytes.
    const buff = Buffer.alloc(4);
    buff.writeUInt32LE(inputBuffer.length, 0);
    return buff;
  }
}