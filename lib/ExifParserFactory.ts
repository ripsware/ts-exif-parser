import {ExifParser} from './ExifParser';

export class ExifParserFactory {
  public static create(buffer: Buffer | ArrayBuffer): ExifParser {
    if (buffer instanceof ArrayBuffer) {
      const DOMBufferStream = require('./DOMBufferStream').DOMBufferStream;
      return new ExifParser(new DOMBufferStream(buffer, 0, buffer.byteLength, true));
    } else {
      const NodeBufferStream = require('./BufferStream').BufferStream;
      return new ExifParser(new NodeBufferStream(buffer, 0, (<Buffer>buffer).length, true));
    }
  }
}
