import { JpegParser } from './JpegParser';
import { ThumbnailTypes } from './interfaces';
export class ExifData {
    constructor(startMarker, tags, imageSize, thumbnailOffset, thumbnailLength, thumbnailType, app1Offset) {
        this.startMarker = startMarker;
        this.tags = tags;
        this.thumbnailType = thumbnailType;
        this.app1Offset = app1Offset;
        this._imageSize = imageSize;
        this._thumbnailOffset = thumbnailOffset;
        this._thumbnailLength = thumbnailLength;
    }
    hasThumbnail(mime) {
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
    get thumbnailOffset() {
        return this.app1Offset + 6 + this._thumbnailOffset;
    }
    get thumbnailLength() {
        return this._thumbnailLength;
    }
    get thumbnailBuffer() {
        return this.getThumbnailStream().nextBuffer(this._thumbnailLength);
    }
    getThumbnailStream() {
        return this.startMarker.openWithOffset(this.thumbnailOffset);
    }
    get imageSize() {
        return this._imageSize;
    }
    get thumbnailSize() {
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
//# sourceMappingURL=ExifData.js.map