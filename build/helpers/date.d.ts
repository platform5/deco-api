import moment from 'moment';
export declare class DateHelper {
    static moment(date: string | Date | moment.Moment, suggestedFormat?: string | string[]): undefined | moment.Moment;
    static recurrence(start: moment.Moment, end: moment.Moment, unit: 'w' | 'm', frequency: '1/1' | '1/2' | '1/3' | '1/4' | '1/5' | '1/6' | '1/7' | '1/8' | '1/9' | '1/10', daysOfWeekOrMonth: number[], options?: {
        nbDaysLimit?: number;
    }): moment.Moment[];
}
//# sourceMappingURL=date.d.ts.map