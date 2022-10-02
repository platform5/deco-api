import { DynamicDataModel2 } from './dynamicdata2.model';
import { AppModel } from './../app/app.model';
import { ObjectId, Query, Deco } from '../../';
export declare class DynamicHelper {
    static getDecoFromSlug(appId: ObjectId, slug: string): Promise<Deco>;
    static getElementInstance(app: AppModel, slug: string, id: string | ObjectId): Promise<DynamicDataModel2>;
    static getElementInstances(app: AppModel, slug: string, query: Query): Promise<Array<DynamicDataModel2>>;
}
//# sourceMappingURL=dynamic.helper.d.ts.map