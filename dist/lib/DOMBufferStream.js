import { NBufferStream } from './NBufferStream';
export class DOMBufferStream extends NBufferStream {
    constructor(arrayBuffer, offset = 0, length = null, bigEndian = false, parentOffset) {
        super();
        this.arrayBuffer = arrayBuffer;
        this.offset = offset;
        this.length = length;
        this.parentOffset = parentOffset;
        this.textDecoder = new TextDecoder('utf-8');
        this.offset = offset || 0;
        this.length = length || (arrayBuffer.byteLength - offset);
        this.arrayBuffer = arrayBuffer.slice(offset, offset + length);
        this.view = new DataView(this.arrayBuffer, 0, this.arrayBuffer.byteLength);
        this.bigEndian = bigEndian;
        this.offset = 0;
        this.parentOffset = (parentOffset || 0) + offset;
    }
    nextUInt8() {
        const value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
    }
    nextInt8() {
        const value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
    }
    nextUInt16() {
        const value = this.view.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }
    nextUInt32() {
        const value = this.view.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }
    nextInt16() {
        const value = this.view.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }
    nextInt32() {
        const value = this.view.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }
    nextFloat() {
        const value = this.view.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }
    nextDouble() {
        const value = this.view.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
    }
    nextBuffer(length) {
        // this won't work in IE10
        const value = this.arrayBuffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return value;
    }
    remainingLength() {
        return this.arrayBuffer.byteLength - this.offset;
    }
    nextString(length) {
        const value = this.textDecoder.decode(new Uint8Array(this.arrayBuffer.slice(this.offset, this.offset + length)));
        this.offset += length;
        return value;
    }
    mark() {
        const self = this;
        return {
            openWithOffset: self.openWithOffset,
            offset: this.offset,
            getParentOffset: () => self.parentOffset
        };
    }
    openWithOffset(offset) {
        return new DOMBufferStream(this.arrayBuffer, offset, this.arrayBuffer.byteLength - offset, !this.littleEndian, this.parentOffset);
    }
    offsetFrom(marker) {
        return this.parentOffset + this.offset - (marker.offset + marker.getParentOffset());
    }
    skip(amount) {
        this.offset += amount;
    }
    branch(offset, length) {
        length = length || this.arrayBuffer.byteLength - (this.offset + offset);
        return new DOMBufferStream(this.arrayBuffer, this.offset + offset, length, !this.littleEndian, this.parentOffset);
    }
}
//# sourceMappingURL=DOMBufferStream.js.map