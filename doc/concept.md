[Home Documentation](./index.md)

# Concept

## Decorators

api.deco.ts provides a set of features to quickly build a powerful, yet flexible REST API in NodeJS. The main idea behind this library is that you need to *decorate* your classes to plug the features into your code. Why is this important ?

## Only decorated classes are affected by api.deco.ts

If you decorate nothing, api.deco.ts doesn't do much. We recommand that you use a maximum of this library features as it will give you a powerful set of tools. However the tendency is to build large library that, once included pollute your codebase with many useless features. We don't want that to happen. We believe that your code must remain as small and easy to understand as possible. Therefore we haven't built a large framework that you must learn and obey to, rather a set of features that you can use.

## Centered on Models

What will drive your API design is the data that you want to manage with it. These data will be grouped in *models*, which are at the core of api.deco.ts concepts. First you need to create a Model that suits your needs, for exemple:

```js
export PersonModel {

  public firstname: string;

  public lastname: string;

  public age: number;

  public active: boolean;

}
```

This model is a pure Typescript class. In order to add features you can decorate your model:

```js
// the @model(collectionName: string) decorator is your starting point
// it will tell api.deco.ts that this class is a model class and provide the
// collectionName (mongo) in which to store the data
@model('person')
export PersonModel {

  @type.string // @type.XXX decorators define the type of data behind the property
  @validate.required // the library provides a set of @validate.XXX decorators
  @io.all // @io.XXX decorators define the flow of data in regards to input (POST, PUT), output (GET) and storage (save to mongo collection)
  public firstname: string;

  @type.string
  @validate.required
  @io.all
  public lastname: string;

  @type.integer
  @io.all
  public age: number;

  @type.boolean
  @io.all
  public active: boolean
}
```

* [Types decorators](./types.md)
* [Validation decorators](./validates.md)
* [Input / Output decorators](./io.md)

## Based on ExpressJS

We have made the choice to use ExpressJS as foundation for this library. This opinionated decision has helped us to follow a standard and made our features very easy to plug into a well-known and used NodeJS library.

The main idea that often comes into play with api.deco.ts is the concept of Express *middlewares*. Once you have decorated your classes, you can plug middelware to your standard ExpressJS routes and the features begin to come alive in your application.

For exemple, you might have the following route:

```js
router.get(
  '/',
  // ... here you want the API to return a list of persons
);
```

Using the api.deco.ts middelwares you might write the following code: 

```js
import { ControllerMiddleware } from 'api.deco.ts';
import { PersonModel } from 'yourapp/models/person.model';

let controller = new ControllerMiddleware(PersonModel);

router.get(
  '/',
  controller.getAll()
);
```

In fact, api.deco.ts provides some helper methods to use standard REST routes. Therefore, instead of writing `/persons` as the URL for the express route, you can write `ControllerMiddleware.getAllRoute()`. This might not seem very important here, but because this method can adjust to your needs and your standards, it is good practice to use it to keep strong consistency in your API.

This code can be a full REST API for our Person model:

```js
import { ControllerMiddleware } from 'api.deco.ts';
import { PersonModel } from 'yourapp/models/person.model';

let controller = new ControllerMiddleware(PersonModel);

router.get(
  ControllerMiddleware.getAllRoute(),
  controller.getAll()
);

router.get(
  ControllerMiddleware.getOneRoute(),
  controller.getOne()
);

router.post(
  ControllerMiddleware.postRoute(),
  controller.post()
);

router.put(
  ControllerMiddleware.putRoute(),
  controller.put()
);

router.delete(
  ControllerMiddleware.deleteRoute(),
  controller.delete()
);
```

You see that the code is very simple yet very intuitive. And because we stricly follow ExpressJS core concepts, you can plug any middleware in your routes to increase the power of your API