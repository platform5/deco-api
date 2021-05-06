import { Model, ObjectId } from '../../';
export interface NbPlayers {
    nb: number;
    inactive?: number;
}
export declare class PushPlayerModel extends Model {
    appId: ObjectId;
    userId?: ObjectId | null;
    regId: string;
    uuid: string;
    type: 'fcm' | 'apn';
    lastVisit: Date;
    tags: Array<string>;
    active: boolean;
    constructor();
    static nbPlayers(appId: ObjectId): Promise<NbPlayers>;
    static tags(appId: ObjectId): Promise<{
        [key: string]: number;
    }>;
}
//# sourceMappingURL=push.player.model.d.ts.map