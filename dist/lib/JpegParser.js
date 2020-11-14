export class JpegParser {
    static parseSections(stream, callback) {
        let len;
        let sectionType;
        stream.bigEndian = true;
        // stop reading the stream at the SOS (Start of Stream) marker,
        // because its length is not stored in the header so we can't
        // know where to jump to. The only marker after that is just EOI (End Of Image) anyway
        while (stream.remainingLength() > 0 && sectionType !== 0xDA) {
            if (stream.nextUInt8() !== 0xFF) {
                return;
            }
            sectionType = stream.nextUInt8();
            // don't read size from markers that have no data
            if ((sectionType >= 0xD0 && sectionType <= 0xD9) || sectionType === 0xDA) {
                len = 0;
            }
            else {
                len = stream.nextUInt16() - 2;
            }
            callback(sectionType, stream.branch(0, len));
            stream.skip(len);
        }
    }
    static getSizeFromSOFSection(stream) {
        stream.skip(1);
        return {
            height: stream.nextUInt16(),
            width: stream.nextUInt16()
        };
    }
    static getSectionName(markerType) {
        let name, index;
        switch (markerType) {
            case 0xD8:
                name = 'SOI';
                break;
            case 0xC4:
                name = 'DHT';
                break;
            case 0xDB:
                name = 'DQT';
                break;
            case 0xDD:
                name = 'DRI';
                break;
            case 0xDA:
                name = 'SOS';
                break;
            case 0xFE:
                name = 'COM';
                break;
            case 0xD9:
                name = 'EOI';
                break;
            default:
                if (markerType >= 0xE0 && markerType <= 0xEF) {
                    name = 'APP';
                    index = markerType - 0xE0;
                }
                else if (markerType >= 0xC0 && markerType <= 0xCF && markerType !== 0xC4 && markerType !== 0xC8 && markerType !== 0xCC) {
                    name = 'SOF';
                    index = markerType - 0xC0;
                }
                else if (markerType >= 0xD0 && markerType <= 0xD7) {
                    name = 'RST';
                    index = markerType - 0xD0;
                }
                break;
        }
        const nameStruct = {
            name: name
        };
        if (typeof index === 'number') {
            nameStruct.index = index;
        }
        return nameStruct;
    }
}
//# sourceMappingURL=JpegParser.js.map