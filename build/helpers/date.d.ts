import moment from 'moment';
export declare class DateHelper {
    static moment(date: string | Date | moment.Moment, suggestedFormat?: string | string[]): undefined | moment.Moment;
    static recurrence(start: moment.Moment, end: moment.Moment, unit: 'w' | 'm', frequency: '1/1' | '1/2' | '1/3', daysOfWeekOrMonth: number[], options?: {
        nbDaysLimit?: number;
    }): moment.Moment[];
}
//# sourceMappingURL=date.d.ts.map