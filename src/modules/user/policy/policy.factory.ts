import {  Policy, PolicyRule, PolicyCondition } from './policy.model';
let debug = require('debug')('app:controller:policy:factory');

export class PolicyFactory  {

  static authenticate() {
    return new Policy({
      route: [
        {
          conditions: {
            key: {
              type: 'property',
              propertySource: 'res.locals',
              pointer: 'user'
            },          
            operation: 'exists'
          }
        }
      ]
    });
  }

  static paramMustExist(param: string) {
    return new Policy({
      route: [
        {
          conditions: {
            key: {
              type: 'property',
              propertySource: 'req.params',
              pointer: param
            },          
            operation: 'exists'
          }
        }
      ]
    });
  }

  static localsMustExist(param: string) {
    return new Policy({
      route: [
        {
          conditions: {
            key: {
              type: 'property',
              propertySource: 'res.locals',
              pointer: param
            },          
            operation: 'exists'
          }
        }
      ]
    });
  }

  static keyMustEqual(key: string, source: 'res.locals', pointer: string) {
    const policy = new Policy();
    if (source === 'res.locals') {
      policy.extend(PolicyFactory.localsMustExist(pointer));
    }
    policy.extend(new Policy({
      access: [{
        conditions: {
          key: key,
          operation: 'equals',
          value: {
            type: 'property',
            propertySource: source,
            pointer: pointer
          }
        }
      }]
    }));
    return policy;
  }

  static appId() {
    return PolicyFactory.keyMustEqual('appId', 'res.locals', 'app._id');
  }

  static shopId() {
    return PolicyFactory.keyMustEqual('shopId', 'res.locals', 'shop._id');
  }

  static appKeyMustBeEqualsTo(key: string, value: any) {
    return new Policy({
      route: [
        {
          conditions: {
            key: {
              type: 'property',
              propertySource: 'res.locals',
              pointer: 'app.' + key
            },          
            operation: 'equals',
            value: value
          }
        }
      ]
    })
  }

  static owner() {
    return new Policy({
      access: [
        {
          conditions: {
            key: '_createdBy', 
            operation: 'equals',
            value: {
              type: 'property',
              propertySource: 'res.locals',
              pointer: 'user._id'
            }
          }
        }
      ]
    });
  }

  static userRole(roles: string | Array<string>, operation: 'include' | 'exclude' = 'include') {
    if (!Array.isArray(roles)) { roles = [roles]};
    return new Policy({
      route: [
        {
          conditions: [
            {
              key: {
                type: 'property',
                propertySource: 'res.locals',
                pointer: 'user'
              },          
              operation: 'exists'
            },
            {
              key: {
                type: 'property',
                propertySource: 'res.locals',
                pointer: 'user.roles'
              }, 
              operation: operation,
              value: roles
            }
          ] 
        }
      ]
    });
  }

  public static memberCanDoAction(actions: Array<string>) {
    const policyRule: PolicyRule = {
      conditionsOperator: 'or',
      conditions: []
    };
    for (let action of actions) {
      const condition: PolicyCondition = {
        key: {
          type: 'property',
          propertySource: 'res.locals',
          pointer: 'userAction'
        },
        operation: 'include',
        value: action
      };
      (policyRule.conditions as Array<PolicyCondition>).push(condition);
    }
    return new Policy({
      route: [
        policyRule
      ]
    });
  }

  public static userMustBeMember() {
    return PolicyFactory.keyMustEqual('members.userId', 'res.locals', 'user._id');
  }

  public static projectMember(role: 'reader' | 'member' | 'manager') {
    let roles: Array<'reader'|'member'|'manager'> = ['manager'];
    if (role === 'member' || role === 'reader') {
      roles.push('member');
    }
    if (role === 'reader') {
      roles.push('reader');
    }
    return PolicyFactory.authenticate().extend({
      route: [
        {
          conditions: {
            key: {
              type: 'query',
              queryModel: 'Step',
              queryType: 'one',
              query: {members: {$elemMatch: {userId: '$res.locals.user._id', role: {$in: roles}}}, _id: '$req.params.projectId'},
              pointer: '_id'
            },          
            operation: 'exists'
          }
        }
      ]
    });
  }

  static apiKey() {

    const expires = [
      { expires: null },
      { expires: {$exists: false}},
      { expires: {$gt: "$now"}}
    ];

    return new Policy({
      route: [
        {
          conditions: {
            key: {
              type: 'query',
              queryModel: 'App',
              queryType: 'one',
              query: {'publicKeys': {$elemMatch: {key: '$req.query.apiKey', active: true, $or: expires}}},
              pointer: '_id'
            },
            operation: 'exists'
          }
        }
      ]
    });
  }
}