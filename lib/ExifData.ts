import {JpegParser} from './JpegParser';
import {NBufferStream} from './NBufferStream';
import {ExifTags, Size, ThumbnailTypes} from './interfaces';

export class ExifData {

  private readonly _imageSize?: Size;
  private readonly _thumbnailOffset?: number;
  private readonly _thumbnailLength?: number;
  private _thumbnailSize: Size;

  constructor(
    public startMarker?: NBufferStream<any>,
    public tags?: ExifTags,
    imageSize?: Size,
    thumbnailOffset?: number,
    thumbnailLength?: number,
    public thumbnailType?: ThumbnailTypes,
    public app1Offset?: number
  ) {
    this._imageSize = imageSize;
    this._thumbnailOffset = thumbnailOffset;
    this._thumbnailLength = thumbnailLength;
  }

  hasThumbnail(mime: string | boolean): boolean {
    if (!this._thumbnailOffset || !this._thumbnailLength) {
      return false;
    }
    if (typeof mime !== 'string') {
      return true;
    }
    if (mime.toLowerCase().trim() === 'image/jpeg') {
      return this.thumbnailType === ThumbnailTypes.jpeg;
    }
    if (mime.toLowerCase().trim() === 'image/tiff') {
      return this.thumbnailType === ThumbnailTypes.tiff;
    }
    return false;
  }

  get thumbnailOffset(): number {
    return this.app1Offset + 6 + this._thumbnailOffset;
  }

  get thumbnailLength(): number {
    return this._thumbnailLength;
  }

  get thumbnailBuffer(): ArrayBuffer {
    return this.getThumbnailStream().nextBuffer(this._thumbnailLength);
  }

  private getThumbnailStream() {
    return this.startMarker.openWithOffset(this.thumbnailOffset);
  }

  get imageSize(): Size {
    return this._imageSize;
  }

  get thumbnailSize(): Size {
    if (this._thumbnailSize) {
      return this._thumbnailSize;
    }
    const stream = this.getThumbnailStream();
    const self = this;
    JpegParser.parseSections(stream, (sectionType, sectionStream) => {
      if (JpegParser.getSectionName(sectionType).name === 'SOF') {
        self._thumbnailSize = JpegParser.getSizeFromSOFSection(sectionStream);
      }
    });
    return this._thumbnailSize;
  }
}
