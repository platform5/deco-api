import { Model } from './../../../decorators/model';
import { Policy } from './policy.model';

export class PolicyContainer {

  private policies: {
    [key: string]: Array<Policy>
  } = {};

  private queryModels: {
    [key: string]: typeof Model
  } = {};



  public register(key: string, policy: Policy) {
    if (!this.policies[key]) {
      this.policies[key] = [];
    }
    this.policies[key].push(policy);
  }

  public get(key: string) {
    return this.policies[key] || [];
  }

  public registerQueryModel(name: string, model: typeof Model) {
    this.queryModels[name] = model;
  }

  public getQueryModel(name: string): typeof Model {
    return this.queryModels[name];
  }
}

const policyContainer = new PolicyContainer;
export { policyContainer};