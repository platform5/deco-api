import moment from 'moment';

export class DateHelper {
  public static moment(date: string | Date | moment.Moment, suggestedFormat?: string | string[]): undefined | moment.Moment {
    if (!date) return undefined;
    let m: moment.Moment | undefined;
    if (typeof date === 'string') {

      const seemsIsoString = date.includes('T') && date.includes('Z');
      if (seemsIsoString) {
        m = moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSSZ');
        if (m.isValid()) {
          return m;
        }
      }

      if (suggestedFormat) {
        const formats = Array.isArray(suggestedFormat) ? suggestedFormat : [suggestedFormat];
        for (const format of formats) {
          m = moment(date, format);
          if (m.isValid()) {
            return m;
          }
          m = undefined;
        }
      }

      if (date.length === 10 && date.substr(2, 1) === '-' && date.substr(5, 1) === '-') {
        m = moment(date, 'DD-MM-YYYY');
      } else if (date.length === 16 && date.substr(2, 1) === '-' && date.substr(5, 1) === '-' && date.substr(10, 1) === ' ' && date.substr(13, 1) === ':') {
        m = moment(date, 'DD-MM-YYYY HH:mm');
      } else if (date.length === 8 && date.substr(2, 1) === '-' && date.substr(5, 1) === '-') {
        m = moment(date, 'DD-MM-YY');
      } else if (date.length === 10 && date.substr(2, 1) === '/' && date.substr(5, 1) === '/') {
        m = moment(date, 'DD/MM/YYYY');
      } else if (date.length === 16 && date.substr(2, 1) === '/' && date.substr(5, 1) === '/' && date.substr(10, 1) === ' ' && date.substr(13, 1) === ':') {
        m = moment(date, 'DD/MM/YYYY HH:mm');
      } else if (date.length === 8 && date.substr(2, 1) === '/' && date.substr(5, 1) === '/') {
        m = moment(date, 'DD/MM/YY');
      } else if (date.length === 10 && date.substr(2, 1) === '.' && date.substr(5, 1) === '.') {
        m = moment(date, 'DD.MM.YYYY');
      } else if (date.length === 16 && date.substr(2, 1) === '.' && date.substr(5, 1) === '.' && date.substr(10, 1) === ' ' && date.substr(13, 1) === ':') {
        m = moment(date, 'DD.MM.YYYY HH:mm');
      } else if (date.length === 8 && date.substr(2, 1) === '.' && date.substr(5, 1) === '.') {
        m = moment(date, 'DD.MM.YY');
      } else if (date.length > 10 && date.indexOf('T') !== -1 && date.indexOf('+') !== -1) {
        m = moment(date);
      } else {
        m = moment(date);
      }
    } else if (date instanceof Date) {
      m = moment(date);
    } else if (!moment.isMoment(date)) {
      m = moment(date);
      if (!m.isValid) {
        return undefined;
      }
    } else {
      m = date;
    }

    return m;
  }

  public static recurrence(
    start: moment.Moment, 
    end: moment.Moment, 
    unit: 'w' | 'm', 
    frequency: '1/1' | '1/2' | '1/3', 
    daysOfWeekOrMonth: number[], 
    options?: {nbDaysLimit?: number}): moment.Moment[] {

    if (!start.isValid() || !end.isValid || end.isBefore(start)) {
      throw new Error('Invalid start/end dates, end must be after start');
    }

    const nbDaysLimit = options?.nbDaysLimit || 365 *5;
    if (end.diff(start, 'days') > nbDaysLimit) {
      throw new Error('Invalid start/end dates, end is too far from start');
    }

    const current = start.clone();
    const dates: moment.Moment[] = [];
    const modulos = {
      '1/1': 1,
      '1/2': 2,
      '1/3': 3,
      '1/4': 4
    };
    let unitNb = 1;
    let foundFirstDate = false;
    let unitIndex = unit === 'w' ? current.week() : current.month();
    while(current.isSameOrBefore(end)) {
      if(unit === 'w' && !daysOfWeekOrMonth.includes(current.isoWeekday())) {
        current.add(1, 'day');
        continue; // ignored as not the right day of week
      }
      if(unit === 'm' && !daysOfWeekOrMonth.includes(current.day())) {
        current.add(1, 'day');
        continue; // ignored as not the right day of week
      }
      const currentUnitIndex = unit === 'w' ? current.week() : current.month();
      if (unitIndex !== currentUnitIndex) {
        unitNb++;
      }
      unitIndex = currentUnitIndex;
      // we ignore the frequency only after finding at least one available date
      if (foundFirstDate && unitNb % modulos[frequency] !== 0) {
        current.add(1, 'day');
        continue; // ignored as not the right frequency
      }
      if (!foundFirstDate) {
        foundFirstDate = true;
        unitNb = 1;
      }
      
      dates.push(current.clone());
      
      current.add(1, 'day');
    }
    return dates;
  }
}
