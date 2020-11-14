export class NBufferStream {
    get littleEndian() {
        return !this.bigEndian;
    }
    set littleEndian(value) {
        this.bigEndian = !value;
    }
}
//# sourceMappingURL=NBufferStream.js.map