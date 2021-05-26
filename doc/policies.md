[Home Documentation](./index.md)

# Policies

The role of Deco API Policies is to protect the API routes with a very customizable set of tools. It can be used to protect lots of different scenarios such as:

* Ensure current user is logged in
* Ensure current user has some sort of properties attached to it
* Ensure current user has some role
* Ensure current user is a member of some data instance. [Learn more with the Members models](./members.md).
* Ensure current user is the creator of the model it is trying to edit/delete
* ...

## How Policies work

At the route level, you must:

1. Attach a policy to the `res.locals.policy` property
2. Apply the policy by placing the `checkRoutePolicy()` method in the middleware chain.

Exemple:

```ts
router.get(
  ControllerMiddleware.getOneRoute(),
  controller.addPolicy(PolicyFactory.authenticate()),
  controller.checkRoutePolicy(),
  controller.getOne()
);
```

The middleware chain above reads as:

1. Create a `GET` route following the `getOneRoute` convention
2. Add a policy to the route, using the `PolicyFactory` with a rule checking for the user to be authenticated
3. Apply the policy to the route. If the current context of the route satisfies the policy go forward, otherwise send an `Access Denied` 500 error
4. Execute the purpose of the route

In the following sections we will explore in details how this work and learn more things including:

* Use policies in a route controller
* How to add a policy
* Leverage the `PolicyFactory`
* Create custom policies to suit specific needs
* Make use of policies *mounting points*

You might also be interested to [learn about the Members models](./members.md) which can create policies automatically for you following a *members* pattern.

## Prepare a route Controller to use Policies

In Deco API, the most basic way to create a controller is to create an instance of `ControllerMiddleware` and then use its method to create routes. If you want to use policies you only need to use the extended version of this middleware called `PolicyController`:

```ts
let controller = new PolicyController(ProductModel);

router.get(
  ControllerMiddleware.getAllRoute(),
  AppMiddleware.fetchWithPublicKey,
  controller.prepareQueryFromReq(),
  controller.getAll(null, {addCountInKey: '__count'})
);

```

Once you have the right controller instance you can use the following methods:

* `addPolicy(newPolicy: Policy | Policy[])`
* `checkRoutePolicy()`
* `registerPolicyMountingPoint(key: string | string[])`


## How to add a Policy to a route

At the most basic level, a policy is an instance of `Policy` stored in `res.locals.policy`. You can add any `Policy` to a route with the `policyController.addPolicy()` middleware.

Internally there will always only be one policy attached to the route. When you call `addPolicy` it will check if a policy is already attached and if yes it will *extend* it to include the rules of the new provided policy/policies.

Once you have attached all the policies to your route, don't forget to add the `policyController.checkRoutePolicy()` middleware to make sure the policies are enforced in your route.

## Leverage the PolicyFactory

Policies are very powerful. They have lots of settings allowing for nearly every scenarios. The `PolicyFactory` is here to help you quickly setup the rights rules without the need to dig deep in all the intrecacies of the `Policy` class.

The `PolicyFactory` contains a set of static methods. They all return a `Policy` instance that you can directly use in `addPolicy()` such as in:

```ts
controller.addPolicy(PolicyFactory.authenticate()),
```

At this point it is important to note that policies come in two flavours:

1. Route policies
2. Access policies

### Route policies

A route policy check value in the context of the current request. It can use data currently stored in `req` and `res`. It is used to ensure autentication (`res.locals.user` must contain the user) or ensuring that a body has some value (`req.body.user` exists for exemple.)

### Access policies

Access policies on the other hand are used to extend the query that will be performed against the database. They are used for exemple to ensure that a route only return docuements that belong to the current user (`{_createdBy: res.locals.user._id}`)

Let's see these methods in detail:

### `authenticate()` (route policy)

As its name suggest, the return policy will ensure that the current request is made with an authenticated user. This is done by checking that the `res.locas.user` propery exists and has a value.

### `paramMustExist(param: string)`  (route policy)

This policy ensure that the current request contains a param (given in argument). For exemple, if setting it as: `PolicyFactory.paramMustExist('elementId')` it will ensure that `req.params.elementId` exists.

### `localsMustExist(param: string)` (route policy)

This policy is very similar to `paramMustExist` but ensure that a propery exists in `res.locals` instead of in `req.params. For exemple, if setting it as: `PolicyFactory.localsMustExist('settings')` it will ensure that `req.params.settings` exists.

### `appId()` (access policy)

This policy can be used when doing an operation on a `Model` that has an `appId` value. For exemple, each `User` have an `appId` property.

When doing a request, it is common to provide an `apiKey` that will be used in a route in order to grant access for this app. When doing so, it is common to place the `App` instance in `res.locals.app`.

The `appId()` policy assumes the conventions above. Therefore, it is used when:

* an app instance has been fetched and placed in `res.locals.app`, and:
* the route is used to `get()`, `getAll()`, `put()`, `post()` or `delete()` on a controller handling a Model with an `appId` property.

With this is mind, the `appId()` policy will ensure that:

* the current requested model appId is equals to the currently fetchd `app._id` related to the `apiKey`

The strength of this policy is that it performs very well both in *multiple* (getAll) and *single* (get, put, post, delete). When possible it will extends the database `query` and then the database will only return results that match the rule. This prevent from fetching irrelevant data from the database and increase performance. When this is not possible it will check that the `appId` property of the fetched element follows the right rule.

### `keyMustEqual(key: string, source: 'res.locals', pointer: string)` (access policy)

*This policy is used internally by `appId()` above.*

Basically it will enure that the model that we are trying to fetch with `get()`, `getAll()`, `put()`, `post()` or `delete()` on a controller handling a Model follows the following rule:

*The fetched model must have a key equals to a value in `source`.*

In order to fully understand this policy let's talk about sources and pointers.

* The `source` describe an object that we will use to get data
* The `pointer` describe where in the object we get the data from

For exemple:

* With `source = 'res.locals'`
* and `pointer = 'app._id'

the value used for comparison will be `res.locals.app._id`. It is common to use a source as `res.locals` but it can be any other accessible object such as `req.body` for exemple.

In the case of the `appId()` policy factory, we use `keyMustEqual()` as such:

```ts
return PolicyFactory.keyMustEqual('appId', 'res.locals', 'app._id');
```

It reads: *The fetched model must have the `appId` key equals to the value currently stored in `res.locals.app._id`*




### `appKeyMustBeEqualsTo(key: string, value: any)` (route policy)

Ensure that the current `res.locals.app` object contains a key named with the value in `key` and equals to the value contained in `value`.

### `owner()` (access policy)

Ensure that the fetched model has the property `_createdBy` set to the value of the current `res.locals.user._id` value.

### `userRole(roles: string | Array<string>, operation: 'include' | 'exclude' = 'include')` (route policy)

Ensure that the current logged in user (in `res.locals.user`) has a property named `roles` with either contain (`operation: 'include'`) or do not contain (`operation: 'exclude'`) the `roles` given as first argument.

### `memberCanDoAction(actions: Array<string>)` (route policy)

Ensure that the value in `res.locals.userAction` includes at least one of the given `actions`.

`res.locals.userAction` must have been set before hand, commonly with the `MembersController.fetchUserActions()` middleware.

[Learn more about the Members models](./members.md).

### `userMustBeMember()` (access policy)

Ensure that the current logged in user is a member of the models that the request is fetching.

### `apiKey()`

Ensure that the current `apiKey`, given in `req.query.apiKey` is valid.

## Create custom policies

Policies are very powerful and can be set up to follow many scenarios. If you want to create a custom policy, all you need to do is create a new instance of the `Policy` with the values you need and attach it to your route.

Here is the `Policy` interface:

```ts
export interface PolicyInterface {
  route?: Array<PolicyRule>;
  access?: Array<PolicyRule>;
}
```

Basically you need to attach one or several `PolicyRule` to either the `route` or `access` property. The other properties are not implemented yet.

When you attach a rule to the `route` property, the rule will be evaluated on the call to `checkPolicyRoute()`. If you attach a rule to the `access` property, it will be used to extend the *Query* executed against the database to fetch the desired data.

Here is the `PolicyRule` interface: 

```ts
export interface PolicyRule {
  method?: Array<'get' | 'post' | 'put' | 'delete' | string>, // if not provided, apply to all, otherwise only apply to these methods
  //prepare?: Array<PolicyPointer>;
  conditions: PolicyCondition | PolicyCondition[];
  conditionsOperator?: 'and' | 'or'; // and is default  
  access?: boolean; // true for allow access (default)
}
```

* `method`: is an array of method when the rule must apply.
* `conditions`: one or several condition to check that will define if the policy applies or not
* `conditionsOperator`: decide if *all* conditions must apply (`and`) or if one is enough `or`
* `access`: if true (default), the policy will grant access when the conditions are satisfied. If `false` it's the opposite, the access will be denied if the conditions satisfies.

Now it's time to look at the `PolicyCondition` interface:

```ts
export interface PolicyCondition {
  key: PolicyPointer;
  operation: 'include' | 'exclude' | 'exists' | '!exists' | 'equals';
  value?: PolicyPointer;
}
```

This interface is very simple. It ensure that two values (fetched with a `PolicyPointer`) relate to each other according to the given `operation`.

* `include`: `value` must contain at least of of `key`
* `exclude`: `value` must not contain any value from `key`
* `exists`: the key must exists (not `undefined`). `value` is irrelevant
* `!exists`: opposite of `exists`
* `equals`: `value` must be equals to `key`

Note that `include` and `exclude` can work with array and non array values. If a value is not an array it will be interpreted as `[value]`

Finally, let's look at the `PolicyPointer`:

```ts
export type PolicyPointer = PolicyPointerConfig | string | number | boolean | Array<string>;

export interface PolicyPointerConfig {
  type?: 'default' | 'property' | 'query' | 'prepared';
  propertySource?: 'element' | 'res.locals' | 'req.query' | 'req.params';
  pointer: any;
  queryModel?: string | ObjectId | typeof Model; // string = Core Model, ObjectId = DynamicConfig
  queryType?: 'one' | 'many';
  query?: any;
}
```

If the pointer is `string`, `number`, `boolean` or `Array<string>`, its value is directly applied. Otherwise it will be fetched using the `PolicyPointerConfig`.

This config is a powerful to extract data from many different sources. You can look at the `PolicyController.computePointer() method to learn more about how the pointer config is evaluated.

## Policies Mounting Points

Policies can be used to de-coupled right management and API configuration. For exemple, you can hard-code a fully-feature modules with many routes performing different actions. Each of this route will be attributed one or several *Policy Mounting Point*. These routes will not be hard-coded protected but the mounting points can be used by a consumer to set the policies according to its need.

This allow a developer to create a standalone module that can be used in several projects with different right management needs.

### Set a mounting point on a route

It is common practice to set mounting point on routes, even if they are not required immediately. Especially if the API is built into a module and shipped in several applications.

Exemple: 

```ts
router.post(
  '/:elementId/members/:userId',
  MembersController.fetchUserActions('project', ['project', 'project.member', 'project.members.add']),
  // The following line register three mounting points
  mdController.registerPolicyMountingPoint(['project', 'project.settings', 'project.settings.members']),
  mdController.checkRoutePolicy(),
  MembersController.addMemberController('project')
);
```

In the code above, there are already some rules applied such as the `members` type of policies. They are enforced via `checkRoutePolicy()`. But there are also three mounting points set so that consumer of this code can extend the policies.

### Registering policies to a mounting point

Now, from any other part of the application, one can register policies to the given mounting point. Here is how:

 
```ts
import { policyContainer, PolicyFactory, Policy } from 'deco-api';

policyContainer.register('project', PolicyFactory.appId());
policyContainer.register('project.settings', PolicyFactory.authenticate());
policyContainer.register('project', new Policy({
  route: [{
    method: ['post'],
    conditionsOperator: 'or',
    conditions: [
      {
        key: {
          type: 'query',
          queryModel: 'project',
          queryType: 'one',
          query: {appId: '$res.locals.app._id'},
          pointer: '_id'
        },
        operation: '!exists'
      },
      {
        key: {
          type: 'property',
          propertySource: 'res.locals',
          pointer: 'app.enableMultipleProjects'
        },
        operation: 'equals',
        value: true
      }
    ]
  }]
}));
```

The code above is first simple and then quite complicated. Let's dive in:

* Registration of policies in mounting point is done via the `policyContainer.register()` method.
* With it you can attach any policy (instnace of `Policy`) 

The custom policy rule puts together quite a few things learnt on this page. Basically it will check two conditions:

1. First it checks that the `Project` model do not have any document stored in the database 
2. Secondly it checks that the `app.enableMultipleProjects` property is set to `true`

As the `conditionsOperator` is set to `or` and the method to `['post']`, the rule can be read as:

*It is allowed to create a new project if none already exists in the app OR if the settings called `enableMultipleProjects` is set to true in the app instance.*