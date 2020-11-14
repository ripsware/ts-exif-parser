import {ExifSections} from './ExifSectionParser';
import {DateUtil} from './DateUtil';

export module simplify {

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
  const dateTags: any[] = [
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

  export function castDegreeValues(
    getTagValue: (t: { name?: string; value: any; section?: any, type?: any }) => any,
    setTagValue: (t: { name?: string, value: any, section?: any, type?: any }, value: any) => void
  ) {
    degreeTags.forEach((t) => {
      const degreeVal = getTagValue(t as any);
      if (degreeVal) {
        const degreeRef = getTagValue({section: t.section, type: t.refType, name: t.refName} as any);
        const degreeNumRef = degreeRef === t.posVal ? 1 : -1;
        const degree = (degreeVal[0] + (degreeVal[1] / 60) + (degreeVal[2] / 3600)) * degreeNumRef;
        setTagValue(t as any, degree);
      }
    });
  }

  export function castDateValues(
    getTagValue: (t: { name?: string; value: any; section?: any, type?: any }) => any,
    setTagValue: (t: { name?: string, value: any, section?: any, type?: any }, value: any) => void
  ) {
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

  export function simplifyValue(values: number[] | number, format): number {
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
    return values as any;
  }
}
