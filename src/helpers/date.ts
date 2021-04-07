import moment from 'moment';

export class DateHelper {
  public static moment(date: string | moment.Moment): undefined | moment.Moment {
    if (!date) return undefined;
    let m: moment.Moment;
    if (typeof date === 'string') {
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
}
