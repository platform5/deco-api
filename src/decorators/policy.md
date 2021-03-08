# What is a Policy ?

A Policy is a JSON describing the access right to a Model. It can be use in core models with decorators and with DynamicModels with the policy property of the ConfigModel.

# Policy Type Definition

```js
export class QueryByModel {
  model: string; // can be either a string of a core model such as 'UserModel' or the slug of a DynamicModel
  query: any; // exemple: {"members.userId": "$userId"}
  compareModelWithProperty: string; // exemple '_createdBy'
}

export interface ModelAccessPolicy {
  public?: boolean | string; // default is true, if a string is given, we check the value of the property of this string, exemple: 'active'
  roles?: Array<string>; // exemple: ['admin', 'user']
  excludeRoles?: Array<string>; // exemple: ['limited']
  userIdByProperty?: string | Array<string>; // exemple: _createdBy
  queryByModel?: QueryByModel | Array<QueryByModel>;
}

export interface IOPolicy {
  context: 'userIdInProperty' | 'roles' | '*',
  contextValue?: string | Array<string>; // exemple: _cretedyBy for userIdInProperty context or ['admin', 'user'] for roles in context
  properties: '*' | 'extractedFrom' | Array<string>; // exemple: ['email', 'mobilePhone']
  propertiesExtractedFrom?: string; // exemple 'hiddenFields' for extractedFrom in properties
  operation: 'include' | 'exclude'; // default: 'include'
  ignoreOnPost?: boolean; // default: false, if true, this policy doesnt prevent access to POST properties
}

export interface Policy {
  globalModelPolicy?: ModelAccessPolicy;
  readModelPolicy?: ModelAccessPolicy;
  writeModelPolicy?: ModelAccessPolicy;
  getAllPolicy?: ModelAccessPolicy;
  getOnePolicy?: ModelAccessPolicy;
  postPolicy?: ModelAccessPolicy;
  putPolicy?: ModelAccessPolicy;
  deletePolicy?: ModelAccessPolicy;

  globalIOPolicy?: Array<IOPolicy>;
  inputPolicy?: Array<IOPolicy>;
  outputPolicy?: Array<IOPolicy>;
}
```

# Policy Exemple

```js
let policy:Policy = {
  globalModelPolicy: { // this policy will affect all routes, except if a more specific one exists
    public: true // not necessary as it's the default value
  };
  writeModelPolicy: { // this policy will affect all write operations (post, put, delete), except if a more specific one exists
    public: false, // only authenticated users can be granted access 
    roles: ['admin', 'user'], // only users with 'admin' or 'user' role in their roles property can be granted access
    excludeRoles: ['limited'], // if a user has the 'limited' role, it will be refused the access
  },
  deletePolicy: { // this policy will affect only the delete operation
    public: false, // only authenticated users can be granted access
    userIdByProperty: '_createdBy' // only users where the _createdBy property equals the current logged in user can be granted access
  },
  putPolicy: { // this policy will affect only the put operation
    public: false, // only authenticated users can be granted access
    queryByModel: { // it will use a query to another model to determine access,
      model: 'UserModel'; // this value could also be a slug of any DynamicModel of the application
      query: {_id: "$userId"};
      compareModelWithProperty: "_createdBy";
    }
  },
  inputPolicy: [ // this array defines what properties can be access in input operations (post, put)
    {             
      context: 'userIdInProperty', // this first rule applies to the creator
      contextValue: '_createdBy', // because the logged in user has its ID in the _createdBy property
      properties: '*', // and it will INCLUDE all properties (*) => FULL ACCESS to write
      operation: 'include'
    },
    {
      context: '*', // this rule applies to everybody else
      properties: '*', // and will exclude all properties
      operation: 'exclude' // nobody else than the creator can write on this object
    }
  ],
  outputPolicy: [ // this array defines what properties can be access in OUTPUT operations (get)
    {             
      context: 'userIdInProperty', // this first rule applyes to the creator
      contextValue: '_createdBy', // because the logged in user has its ID in the _createdBy property
      properties: '*', // and it will INCLUDE all properties (*) => FULL ACCESS
      operation: 'include'
    },
    {
      context: 'roles', // this second rule applies to authenticated users with specific roles
      contextValue: ['admin', 'user'],
      properties: ['email'], // for these users, only the email property will be hidden (exclude)
      operation: 'exclude'
    },
    {
      context: '*', // this last rule applies to everybody else
      properties: 'extractedFrom', // it will extract a property list from a property of the object
      propertiesExtractedFrom: 'hiddenFields', // in this case, the hiddenFields property, allowing the creator to set some fields hidden to the public
      operation: 'exclude'
    }
  ]
}
```


# Policy public value

The public property of the policy is currently ONLY used to prevent access to unauthenticated users if public: false. However, it doesn't grand access by writing public: true (meaning, it doesn't overwrite the other policies). Therefore, it doesn't really make sense to set public: true if used in combination with other rules. It really only is destined to be use ad public: false.