import {NBufferStream} from './NBufferStream';
import {Marker} from './interfaces';

export enum ExifSections {
  IFD0 = 1,
  IFD1 = 2,
  GPSIFD = 3,
  SubIFD = 4,
  InteropIFD = 5
}

export class ExifSectionParser {

  public static parseTags(stream: NBufferStream<any>, iterator: (section: number, tagType: any, value: any, format: any) => void): boolean {
    let tiffMarker;
    try {
      tiffMarker = ExifSectionParser.readHeader(stream);
    } catch (e) {
      return false;	// ignore APP1 sections with invalid headers
    }
    let subIfdOffset, gpsOffset, interopOffset;
    const ifd0Stream = tiffMarker.openWithOffset(stream.nextUInt32());
    ExifSectionParser.readIFDSection(tiffMarker, ifd0Stream, function (tagType, value, format) {
      switch (tagType) {
        case 0x8825:
          gpsOffset = value[0];
          break;
        case 0x8769:
          subIfdOffset = value[0];
          break;
        default:
          iterator(ExifSections.IFD0, tagType, value, format);
          break;
      }
    });
    const ifd1Offset = ifd0Stream.nextUInt32();
    if (ifd1Offset !== 0) {
      const ifd1Stream = tiffMarker.openWithOffset(ifd1Offset);
      ExifSectionParser.readIFDSection(tiffMarker, ifd1Stream, iterator.bind(null, ExifSections.IFD1));
    }

    if (gpsOffset) {
      const gpsStream = tiffMarker.openWithOffset(gpsOffset);
      ExifSectionParser.readIFDSection(tiffMarker, gpsStream, iterator.bind(null, ExifSections.GPSIFD));
    }

    if (subIfdOffset) {
      const subIfdStream = tiffMarker.openWithOffset(subIfdOffset), InteropIFD = ExifSections.InteropIFD;
      ExifSectionParser.readIFDSection(tiffMarker, subIfdStream, function (tagType, value, format) {
        if (tagType === 0xA005) {
          interopOffset = value[0];
        } else {
          iterator(InteropIFD, tagType, value, format);
        }
      });
    }

    if (interopOffset) {
      const interopStream = tiffMarker.openWithOffset(interopOffset);
      ExifSectionParser.readIFDSection(tiffMarker, interopStream, iterator.bind(null, ExifSections.InteropIFD));
    }
    return true;
  }


  private static readExifValue(format: number, stream: NBufferStream<any>): number | number[] {
    switch (format) {
      case 1:
        return stream.nextUInt8();
      case 3:
        return stream.nextUInt16();
      case 4:
        return stream.nextUInt32();
      case 5:
        return [stream.nextUInt32(), stream.nextUInt32()];
      case 6:
        return stream.nextInt8();
      case 8:
        return stream.nextUInt16();
      case 9:
        return stream.nextUInt32();
      case 10:
        return [stream.nextInt32(), stream.nextInt32()];
      case 11:
        return stream.nextFloat();
      case 12:
        return stream.nextDouble();
      default:
        throw new Error('Invalid format while decoding: ' + format);
    }
  }

  private static getBytesPerComponent(format: number): number {
    switch (format) {
      case 1:
      case 2:
      case 6:
      case 7:
        return 1;
      case 3:
      case 8:
        return 2;
      case 4:
      case 9:
      case 11:
        return 4;
      case 5:
      case 10:
      case 12:
        return 8;
      default:
        return 0;
    }
  }

  private static readExifTag(tiffMarker: Marker<any>, stream: NBufferStream<any>): { type: number, values: any, format: number } {
    const type = stream.nextUInt16();
    const format = stream.nextUInt16();
    const bytesPerComponent = ExifSectionParser.getBytesPerComponent(format);
    const components = stream.nextUInt32();
    const valueBytes = bytesPerComponent * components;
    let values: any;

    /* if the value is bigger then 4 bytes, the value is in the data section of the IFD
    and the value present in the tag is the offset starting from the tiff header. So we replace the stream
    with a stream that is located at the given offset in the data section. s*/
    if (valueBytes > 4) {
      stream = tiffMarker.openWithOffset(stream.nextUInt32());
    }
    // we don't want to read strings as arrays
    if (format === 2) {
      values = stream.nextString(components);
      // cut off \0 characters
      const lastNull = values.indexOf('\0');
      if (lastNull !== -1) {
        values = values.substr(0, lastNull);
      }
    } else if (format === 7) {
      values = stream.nextBuffer(components);
    } else if (format !== 0) {
      values = [];
      for (let c = 0; c < components; ++c) {
        values.push(ExifSectionParser.readExifValue(format, stream));
      }
    }
    // since our stream is a stateful object, we need to skip remaining bytes
    // so our offset stays correct
    if (valueBytes < 4) {
      stream.skip(4 - valueBytes);
    }

    return {type, values, format};
  }

  private static readIFDSection(
    tiffMarker: Marker<any>,
    stream: NBufferStream<any>,
    iterator: (type: number, values: any, format: number) => void
  ) {
    const numberOfEntries = stream.nextUInt16();
    let tag: { type: number, values: any, format: number };
    for (let i = 0; i < numberOfEntries; ++i) {
      tag = ExifSectionParser.readExifTag(tiffMarker, stream);
      iterator(tag.type, tag.values, tag.format);
    }
  }

  private static readHeader(stream: NBufferStream<any>): Marker<any> {
    const exifHeader = stream.nextString(6);
    if (exifHeader !== 'Exif\0\0') {
      throw new Error('Invalid EXIF header');
    }

    const tiffMarker = stream.mark();
    const tiffHeader = stream.nextUInt16();
    if (tiffHeader === 0x4949) {
      stream.bigEndian = false;
    } else if (tiffHeader === 0x4D4D) {
      stream.bigEndian = true;
    } else {
      throw new Error('Invalid TIFF header');
    }
    if (stream.nextUInt16() !== 0x002A) {
      throw new Error('Invalid TIFF data');
    }
    return tiffMarker;
  }

}
