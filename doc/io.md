[Home Documentation](./index.md)

# Input / Output decorators

## @io.input

Allow the property to be edited with input data in body request. For exemple, a POST request with body: 

```js
{
  "firstname": "John"
}
``` 

will only take the data (John) into account if the `firstname` property is decorated with `@io.input`

## @io.output

Allow the property to be sent in the final response when fetching a Model. For exemle, a GET request to a sepecific model could output: 

```js
{
  "firstname": "John",
  "lastname": "Deer"
}
``` 

Only if the properties `firstname` and `lastname` are decorated with `@io.output`


## @io.toDocument

Allow the property to be saved in the collection. It means that the `firstname` of the model will only be saved if the property is decorated with `@io.toDocument`

## @io.all

Alias for: 

```js
@io.input
@io.output
@io.toDocument
```

This alias is often used as most properties must be inputed, outputed and saved in database.

## @io.fetch (TBC)

Not yet implemented.

# Use cases

As mentionned earlier, most use cases use the `@io.all` decorator. But in some use case it is very usefull to trick the system a little bit. For exemple, when creating a user with a password, you might not want to save the password in clear in the database. Therefore you might have a model like this: 

```js
import { model, Model, type, io, validate } from 'api.deco.ts';
import crypto from 'crypto';
import moment from 'moment';

@model('users')
export class UserModel extends Model {

  @type.string
  @io.all
  @validate.required
  public firstname: string = '';

  @type.string
  @io.all
  @validate.required
  public lastname: string = '';

  @type.string
  @io.all
  @validate.email
  public email: string = '';

  @type.string
  @io.toDocument
  @validate.required
  public hash: string = '';

  static hashFromPassword(password: string) {
    return crypto.createHmac('sha1', Settings.cryptoKey).update(password).digest('hex');
  }

  generateHash(password: string) {
    this.hash = UserModel.hashFromPassword(password);
  }
}
```

In this scenario, you want to save a `hash` property, decorated only with `@io.toDocument` because it is neither inputed (rather computed from a password input) and neither outputed (this would be a high security issue).

What you need then is a method to generate the hash from a password string that is called at some point in the user creation process. This can be done by using hooks in the Controller Middelware

See [Controller Middelware](./controller.md);