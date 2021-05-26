[Home Documentation](./index.md)

# Members

`Members` extends the `Model` class in order to provide a common way to handle roles and right management.

```ts
export class Project extends Members {

}
```

This will give the `Project` model a capability to handle roles on a per-instance level. In order to gain access, a user will need to become a member of the project and given a role.

## Use cases

### Project management

Imagine a project management application. Each project needs to be protected by some roles. For exemple, a user will receive the `admin` role in the project and will be able to perform all actions. Another user will receive a `viewer` role which then can only read the data but cannot perform any writing action.

In this scenario, we will set up the api routes so that they always refer to the project being requested, for exemple:

```
GET /:projectId/
GET /:projectId/task
GET /:projectId/task/:taskId
POST /:projectId/task
PUT /:projectId/task/:taskId
```

This will make it easy to check for the roles of the user in the project (more of this below)

### Shop

Imagine a shop management application. In the shop, we want to define different roles such as:

* Product manager
* Invoicing
* Customer service

with each of the role that can perform different actions.

## Setup the members class

In order to work correctly, a model implementing the `Members` abstraction needs to provide a few more properties:

```ts
export class Project extends Members {

  // a roles property to register each roles in the model instance
  // the roles property is a dictionary listing all actions
  // authorized by the role
  roles: {[key: string]: Array<string>} = {};

  // the members property will list each user that has
  // rights in the instance and store their given roles 
  members: Array<{userId: ObjectId, roles: Array<string>}> = [];

  // the actions() method must return a string array with
  // the list of available actions in the system
  public actions(): Array<string> {
    return [
      'project',
      'project.edit',
      'project.read',
      'project.delete',
      'project.task',
      'project.task.edit',
      'project.task.read',
      'project.task.delete',
    ];
  }
}
```

`Members` has one more property named: `superAdminRole`. This property has a default value of `manager` and define the name of the *Super Admin* role.

Once a user create a new instance of a `Members` kind of model instance, this user will automatically receive membership on the instance with the *Super Admin* role. And this role will always be available in the list of available roles.

If the `manager` value doesnt' suit your needs, you can set it to a differnt value by overriding it: 

```ts
export class Project extends Members {
  public superAdminRole = 'super-admin';
}
```

Once this is in place, we can use this model to setup a controller with nice helpers for managing roles and performing right management.

## Setup a controller using the members abstraction

We will cover two tasks that the controller must handle to leverage the members abstraction:

1. Add routes for managing the members and their roles
2. Protect any routes using the members and roles data

### Routes for managing the members and their roles

As we saw above, each instance of a class abstracting `Members` must have a `roles` and `members` property and these properties need to be handled on a per-instance basis.

Each instance of the model must know its own set of roles and its own list of members. This needs to be manageable with API routes so that a client application can interact with the model and give roles/membership accordingly.

The `Members` module provides a `MembersController` to help with quickly setting up routes to manage membership and roles.

Imagine the Project Management application use case described above. We can manage project roles with the following routes (for simplification there is no right management handling in this routes yet):


```ts

// MembersController expect to find an instance of the data model it will
// manage in `res.locals.XXX` property. In the exemple below, the
// controller.fetchProject middleware is responsible for
// - get the project refered by :elementId and:
// - place an instance of this project in res.locals.project
// Then, when we call method of the MembersConroller, we provide
// the name of the propery in res.locals where the instance is stored

router.post(
  '/:elementId/roles/:role',
  controller.fetchProject,
  MembersController.addRoleController('project')
);

router.put(
  '/:elementId/roles/:role',
  controller.fetchProject,
  MembersController.editRoleController('project')
);

router.delete(
  '/:elementId/roles/:role',
  controller.fetchProject,
  MembersController.removeRoleController('project')
);
```

In the same fashion, here are the routes for managing membership (for simplification there is no right management handling in this routes yet):

```ts
router.get(
  '/:elementId/members',
  controller.fetchProject,
  MembersController.getMembersController('project')
);

router.post(
  '/:elementId/members/:userId',
  controller.fetchProject,
  MembersController.addMemberController('project')
);

router.put(
  '/:elementId/members/:userId',
  controller.fetchProject,
  MembersController.editMemberController('project')
);

router.delete(
  '/:elementId/members/:userId',
  controller.fetchProject,
  MembersController.removeMemberController('project')
);
```

That's it. Our routes are ready to handle roles and membership for any instances of our projects.


### Protecting routes using the members and roles policies

Now that we can add members with specific roles to our projects, we can use these information to protect our routes. For exemple, a user with only `read` access should not be able to perform `POST` requests, but should be able to `GET` data.

Let's see how this works with the routes we have set up above:

#### 

```ts
router.get(
  '/:elementId/members',
  controller.fetchProject,
  MembersController.fetchUserActions('project', ['project', 'project.member', 'project.member.read']),
  controller.checkRoutePolicy(),
  MembersController.getMembersController('project')
);

router.post(
  '/:elementId/members/:userId',
  controller.fetchProject,
  MembersController.fetchUserActions('project', ['project', 'project.member', 'project.member.add']),
  controller.checkRoutePolicy(),
  MembersController.addMemberController('project')
);

router.put(
  '/:elementId/members/:userId',
  controller.fetchProject,
  MembersController.fetchUserActions('project', ['project', 'project.member', 'project.member.edit']),
  controller.checkRoutePolicy(),
  MembersController.editMemberController('project')
);

router.delete(
  '/:elementId/members/:userId',
  controller.fetchProject,
  MembersController.fetchUserActions('project', ['project', 'project.member', 'project.member.delete']),
  controller.checkRoutePolicy(),
  MembersController.removeMemberController('project')
);
```

You've noticed the `MembersController.fetchUserActions` middleware. It has the following signature:

```ts
fetchUserActions(localsProperty: string, addPolicyForActions?: Array<string>)
```

Where:

* `localsProperty` is the name of the property in `res.locals` where to look for the current `Members` instance. And,
* `addPolicyForActions` is an optional list of actions that we want to check the route against.

Basically, this method is here to *prepare* for a Policy check. At this point it might be interesting to get familiar with [Deco API Policies](./policies.md). And what policies are really good at is compare keys stored in `res.locals.XXX` properties. Therefore, this middelware list all the actions that the user can perform in `res.locals.userAction`. This will allow any policies attached to the route to check for those actions.

In order to facilitate membership access check, this method allows you to provide a list of actions that you would like to add a policy for. This will not perform any check yet, but prepare a `Policy`, attach it to the current route and add rules to this policy stating:

*"Make sure that the current logged in user has at least one of these actions attributed"*

At the end of the middleware, you get:

* The list of actions that the user can perform stored as `string[]` in `res.locals.userAction`, and
* A policy attached to the route in `res.locals.policy` containing the rules requested by `addPolicyForActions`

Once this is done, the `PolicyController` takes over to actually apply the policy rules attached to the rule. This is accomplished by `controller.checkRoutePolicy()` where the `controller` is the current controller instance that must be extended from `PolicyController`. 

[You can learn more about policies](./policies.md)