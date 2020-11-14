import {Buffer} from 'buffer';
import {NBufferStream} from './NBufferStream';
import {Marker} from './interfaces';

export class BufferStream extends NBufferStream<Buffer> {
  endPosition: number;

  constructor
  (
    private buffer: Buffer,
    public offset: number = 0,
    private length: number = buffer.length,
    public bigEndian: boolean = false
  ) {
    super();
    this.endPosition = this.offset + length;
  }

  nextUInt8(): number {
    const value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
  }

  nextInt8(): number {
    const value = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return value;
  }

  nextUInt16(): number {
    const value = this.bigEndian ? this.buffer.readUInt16BE(this.offset) : this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  nextUInt32(): number {
    const value = this.bigEndian ? this.buffer.readUInt32BE(this.offset) : this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  nextInt16(): number {
    const value = this.bigEndian ? this.buffer.readInt16BE(this.offset) : this.buffer.readInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  nextInt32(): number {
    const value = this.bigEndian ? this.buffer.readInt32BE(this.offset) : this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  nextFloat(): number {
    const value = this.bigEndian ? this.buffer.readFloatBE(this.offset) : this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return value;
  }

  nextDouble(): number {
    const value = this.bigEndian ? this.buffer.readDoubleBE(this.offset) : this.buffer.readDoubleLE(this.offset);
    this.offset += 8;
    return value;
  }

  nextBuffer(length: number): Buffer {
    const value = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  remainingLength(): number {
    return this.endPosition - this.offset;
  }

  nextString(length: number): string {
    const value = this.buffer.toString('utf8', this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  mark(): Marker<BufferStream> {
    return {
      openWithOffset: this.openWithOffset,
      offset: this.offset
    };
  }

  openWithOffset(offset: number): BufferStream {
    return new BufferStream(this.buffer, (offset || 0) + this.offset, this.endPosition - offset, this.bigEndian);
  }

  offsetFrom(marker: { offset: number }): number {
    return this.offset - marker.offset;
  }

  skip(amount: number) {
    this.offset += amount;
  }

  branch(offset: number, length: number): BufferStream {
    length = typeof length === 'number' ? length : this.endPosition - (this.offset + offset);
    return new BufferStream(this.buffer, this.offset + offset, length, this.bigEndian);
  }
}
