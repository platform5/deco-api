import { Policy } from './policy.model';
export declare class PolicyFactory {
    static authenticate(): Policy;
    static paramMustExist(param: string): Policy;
    static localsMustExist(param: string): Policy;
    static keyMustEqual(key: string, source: 'res.locals', pointer: string): Policy;
    static appId(): Policy;
    static shopId(): Policy;
    static appKeyMustBeEqualsTo(key: string, value: any): Policy;
    static owner(): Policy;
    static userRole(roles: string | Array<string>, operation?: 'include' | 'exclude'): Policy;
    static memberCanDoAction(actions: Array<string>): Policy;
    static userMustBeMember(): Policy;
    static projectMember(role: 'reader' | 'member' | 'manager'): Policy;
    static apiKey(): Policy;
}
//# sourceMappingURL=policy.factory.d.ts.map