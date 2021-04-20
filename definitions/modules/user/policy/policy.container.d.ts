import { Model } from './../../../decorators/model';
import { Policy } from './policy.model';
export declare class PolicyContainer {
    private policies;
    private queryModels;
    register(key: string, policy: Policy): void;
    get(key: string): Policy[];
    registerQueryModel(name: string, model: typeof Model): void;
    getQueryModel(name: string): typeof Model;
}
declare const policyContainer: PolicyContainer;
export { policyContainer };
//# sourceMappingURL=policy.container.d.ts.map