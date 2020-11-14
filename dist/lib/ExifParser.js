import { simplify } from './simplify';
import { JpegParser } from './JpegParser';
import { ExifSectionParser, ExifSections } from './ExifSectionParser';
import { Tags } from './exif-tags';
import { ExifData } from './ExifData';
export class ExifParser {
    constructor(stream) {
        this.stream = stream;
        this.flags = {
            readBinaryTags: false,
            resolveTagNames: true,
            simplifyValues: true,
            imageSize: true,
            hidePointers: true,
            returnTags: true
        };
    }
    set enableBinaryFields(enable) {
        this.flags.readBinaryTags = enable;
    }
    get enableBinaryFields() {
        return this.flags.readBinaryTags;
    }
    set enablePointers(enable) {
        this.flags.hidePointers = !enable;
    }
    get enablePointers() {
        return this.flags.hidePointers;
    }
    set enableTagNames(enable) {
        this.flags.resolveTagNames = enable;
    }
    get enableTagNames() {
        return this.flags.resolveTagNames;
    }
    set enableImageSize(enable) {
        this.flags.imageSize = enable;
    }
    get enableImageSize() {
        return this.flags.imageSize;
    }
    set enableReturnTags(enable) {
        this.flags.returnTags = enable;
    }
    get enableReturnTags() {
        return this.flags.returnTags;
    }
    set enableSimpleValues(enable) {
        this.flags.simplifyValues = enable;
    }
    get enableSimpleValues() {
        return this.flags.simplifyValues;
    }
    parse() {
        const start = this.stream.mark();
        const stream = start.openWithOffset(0);
        const flags = this.flags;
        const tags = {};
        let imageSize;
        let thumbnailOffset;
        let thumbnailLength;
        let thumbnailType;
        let app1Offset;
        const getTagValue = (t) => {
            if (flags.resolveTagNames) {
                return tags[t.name] ? tags[name].value : null;
            }
            const res = Object.entries(tags)
                .map(item => item[1])
                .find(item => item.type === t.type && item.section === t.section);
            return res ? res.value : null;
        };
        const setTagValue = (t, value) => {
            if (flags.resolveTagNames) {
                tags[t.name] = value;
            }
            else {
                Object.entries(tags)
                    .filter(item => item[1].type === t.type && item[1].section === t.section)
                    .forEach(item => tags[item[0]] = value);
            }
        };
        JpegParser.parseSections(stream, function (sectionType, sectionStream) {
            let validExifHeaders;
            const sectionOffset = sectionStream.offsetFrom(start);
            if (sectionType === 0xE1) {
                let counter = 0;
                validExifHeaders = ExifSectionParser.parseTags(sectionStream, function (ifdSection, tagType, value, format) {
                    // ignore binary fields if disabled
                    if (!flags.readBinaryTags && format === 7) {
                        return;
                    }
                    if (tagType === 0x0201) {
                        thumbnailOffset = value[0];
                        if (flags.hidePointers) {
                            return;
                        }
                    }
                    else if (tagType === 0x0202) {
                        thumbnailLength = value[0];
                        if (flags.hidePointers) {
                            return;
                        }
                    }
                    else if (tagType === 0x0103) {
                        thumbnailType = value[0];
                        if (flags.hidePointers) {
                            return;
                        }
                    }
                    // if flag is set to not store tags, return here after storing pointers
                    if (!flags.returnTags) {
                        return;
                    }
                    if (flags.simplifyValues) {
                        value = simplify.simplifyValue(value, format);
                    }
                    if (flags.resolveTagNames) {
                        const sectionTagNames = ifdSection === ExifSections.GPSIFD ? Tags.GPS : Tags.Exif;
                        let name = sectionTagNames[tagType];
                        if (!name) {
                            name = Tags.Exif[tagType];
                        }
                        if (!tags.hasOwnProperty(name)) {
                            tags[name] = value;
                        }
                    }
                    else {
                        tags[`${counter}`] = {
                            section: ifdSection,
                            type: tagType,
                            value: value
                        };
                        counter++;
                    }
                });
                if (validExifHeaders) {
                    app1Offset = sectionOffset;
                }
            }
            else if (flags.imageSize && JpegParser.getSectionName(sectionType).name === 'SOF') {
                imageSize = JpegParser.getSizeFromSOFSection(sectionStream);
            }
        });
        if (flags.simplifyValues) {
            simplify.castDegreeValues(getTagValue, setTagValue);
            simplify.castDateValues(getTagValue, setTagValue);
        }
        return new ExifData(stream, (flags.resolveTagNames ? tags : Object.values(flags)), imageSize, thumbnailOffset, thumbnailLength, thumbnailType, app1Offset);
    }
}
//# sourceMappingURL=ExifParser.js.map