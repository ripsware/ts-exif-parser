export class DateUtil {

  static hours = 3600;
  static minutes = 60;

  /**
   * take date (year, month, day) and time (hour, minutes, seconds) digits in UTC
   * and return a timestamp in seconds
   * @param dateParts
   * @param timeParts
   * @returns {number}
   */
  public static parseDateTimeParts(dateParts: string[], timeParts: string[]): number {
    const parsedDate = dateParts.map(value => isNaN(value as any) ? 0 : parseInt(value as any, null));
    const parsedTime = timeParts.map(value => isNaN(value as any) ? 0 : parseInt(value as any, null));
    return Date.UTC(parsedDate[0], parsedDate[1] - 1, parsedDate[2], parsedTime[0], parsedTime[1], parsedTime[2], 0) / 1000;
  }


  /**
   * parse date with "2004-09-04T23:39:06-08:00" format,
   * one of the formats supported by ISO 8601, and
   * convert to utc timestamp in seconds
   * @param dateTimeStr
   * @returns {number}
   */
  public static parseDateWithTimezoneFormat(dateTimeStr: string): number {

    const dateParts = dateTimeStr.substr(0, 10).split('-');
    const timeParts = dateTimeStr.substr(11, 8).split(':');
    const timezoneStr = dateTimeStr.substr(19, 6);
    const timezoneParts = timezoneStr.split(':').map(parseInt);
    const timezoneOffset = (timezoneParts[0] * DateUtil.hours) + (timezoneParts[1] * DateUtil.minutes);

    return DateUtil.parseDateTimeParts(dateParts, timeParts) - timezoneOffset;
  }


  /**
   * parse date with "YYYY:MM:DD hh:mm:ss" format, convert to utc timestamp in seconds
   * @param dateTimeStr
   * @returns {number}
   */
  public static parseDateWithSpecFormat(dateTimeStr: string): number {
    const parts = dateTimeStr.split(' ');
    const dateParts = parts[0].split(':');
    const timeParts = parts[1].split(':');

    return DateUtil.parseDateTimeParts(dateParts, timeParts);
  }

  public static parseExifDate(dateTimeStr: string): number {
    // some easy checks to determine two common date formats

    // is the date in the standard "YYYY:MM:DD hh:mm:ss" format?
    const isSpecFormat = dateTimeStr.length === 19 && dateTimeStr.charAt(4) === ':';
    // is the date in the non-standard format,
    // "2004-09-04T23:39:06-08:00" to include a timezone?
    const isTimezoneFormat = dateTimeStr.length === 25 && dateTimeStr.charAt(10) === 'T';

    if (isTimezoneFormat) {
      return DateUtil.parseDateWithTimezoneFormat(dateTimeStr);
    } else if (isSpecFormat) {
      return DateUtil.parseDateWithSpecFormat(dateTimeStr);
    }
  }


}



