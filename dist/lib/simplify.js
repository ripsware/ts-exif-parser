import { ExifSections } from './ExifSectionParser';
import { DateUtil } from './DateUtil';
export var simplify;
(function (simplify) {
    const degreeTags = [
        {
            section: ExifSections.GPSIFD,
            type: 0x0002,
            name: 'GPSLatitude',
            refType: 0x0001,
            refName: 'GPSLatitudeRef',
            posVal: 'N'
        },
        {
            section: ExifSections.GPSIFD,
            type: 0x0004,
            name: 'GPSLongitude',
            refType: 0x0003,
            refName: 'GPSLongitudeRef',
            posVal: 'E'
        }
    ];
    const dateTags = [
        {
            section: ExifSections.SubIFD,
            type: 0x0132,
            name: 'ModifyDate'
        },
        {
            section: ExifSections.SubIFD,
            type: 0x9003,
            name: 'DateTimeOriginal'
        },
        {
            section: ExifSections.SubIFD,
            type: 0x9004,
            name: 'CreateDate'
        },
        {
            section: ExifSections.SubIFD,
            type: 0x0132,
            name: 'ModifyDate',
        }
    ];
    function castDegreeValues(getTagValue, setTagValue) {
        degreeTags.forEach((t) => {
            const degreeVal = getTagValue(t);
            if (degreeVal) {
                const degreeRef = getTagValue({ section: t.section, type: t.refType, name: t.refName });
                const degreeNumRef = degreeRef === t.posVal ? 1 : -1;
                const degree = (degreeVal[0] + (degreeVal[1] / 60) + (degreeVal[2] / 3600)) * degreeNumRef;
                setTagValue(t, degree);
            }
        });
    }
    simplify.castDegreeValues = castDegreeValues;
    function castDateValues(getTagValue, setTagValue) {
        dateTags.forEach((t) => {
            const dateStrVal = getTagValue(t);
            if (dateStrVal) {
                // some easy checks to determine two common date formats
                const timestamp = DateUtil.parseExifDate(dateStrVal);
                if (timestamp) {
                    setTagValue(t, timestamp);
                }
            }
        });
    }
    simplify.castDateValues = castDateValues;
    function simplifyValue(values, format) {
        if (values instanceof Array) {
            values = values.map(function (value) {
                if (format === 10 || format === 5) {
                    return value[0] / value[1];
                }
                return value;
            });
            if (values.length === 1) {
                return values[0];
            }
        }
        return values;
    }
    simplify.simplifyValue = simplifyValue;
})(simplify || (simplify = {}));
//# sourceMappingURL=simplify.js.map