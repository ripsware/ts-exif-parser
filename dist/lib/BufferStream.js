import { NBufferStream } from './NBufferStream';
export class BufferStream extends NBufferStream {
    constructor(buffer, offset = 0, length = buffer.length, bigEndian = false) {
        super();
        this.buffer = buffer;
        this.offset = offset;
        this.length = length;
        this.bigEndian = bigEndian;
        this.endPosition = this.offset + length;
    }
    nextUInt8() {
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }
    nextInt8() {
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return value;
    }
    nextUInt16() {
        const value = this.bigEndian ? this.buffer.readUInt16BE(this.offset) : this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    nextUInt32() {
        const value = this.bigEndian ? this.buffer.readUInt32BE(this.offset) : this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    nextInt16() {
        const value = this.bigEndian ? this.buffer.readInt16BE(this.offset) : this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    nextInt32() {
        const value = this.bigEndian ? this.buffer.readInt32BE(this.offset) : this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    nextFloat() {
        const value = this.bigEndian ? this.buffer.readFloatBE(this.offset) : this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }
    nextDouble() {
        const value = this.bigEndian ? this.buffer.readDoubleBE(this.offset) : this.buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return value;
    }
    nextBuffer(length) {
        const value = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    remainingLength() {
        return this.endPosition - this.offset;
    }
    nextString(length) {
        const value = this.buffer.toString('utf8', this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    mark() {
        return {
            openWithOffset: this.openWithOffset,
            offset: this.offset
        };
    }
    openWithOffset(offset) {
        return new BufferStream(this.buffer, (offset || 0) + this.offset, this.endPosition - offset, this.bigEndian);
    }
    offsetFrom(marker) {
        return this.offset - marker.offset;
    }
    skip(amount) {
        this.offset += amount;
    }
    branch(offset, length) {
        length = typeof length === 'number' ? length : this.endPosition - (this.offset + offset);
        return new BufferStream(this.buffer, this.offset + offset, length, this.bigEndian);
    }
}
//# sourceMappingURL=BufferStream.js.map