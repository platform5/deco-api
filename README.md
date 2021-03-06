# deco-api


## Développement

Le package `deco-api` est destiné à être utilisé dans une application maitresse. Dès lors, pour développer le package `deco-api` il est idéal d'en avoir une copie résidant dans l'application maitresse afin de pouvoir utiliser les outils de débogage conventionnels.

Pour cela, voici quelques conseils à suivre:

### Importer le package via un fichier proxy

Créer dans l'application maitresse un fichier `deco-api-proxy.ts` et placer le contenu suivant avec le contenu suivant:

```ts
export * from 'deco-api';
```

Ensuite, dans l'application, au lieu d'écrire `import { Deco } from 'deco-api'`, l'astuce est d'écrire `import { Deco } from './deco-api-proxy';`. Cela aura pour effet que chaque importation passe par le fichier proxy au lieu de directement importer le paquet dépendant.

Une fois, ce proxy en place, on peut l'utiliser pour *activer* un mode debug lorsque c'est nécessaire.

### Utiliser une version locale (copiée du package)

Tout d'abord, il convient de copier une version locale du package `deco-api` dans l'application maitresse. Supposons donc une application avec l'arborescence suivante:

```
/build
/app # contenant le code source non compilé de l'app
/app/deco-api-proxy.ts # le fichier proxy créé ci-dessus
/node_modules
/.gitignore
/package.json
```

Depuis le dossier `/` de l'application lancez la commande suivante:

```sh
rm -rf ./app/deco-api # efface le dossier dans le cas où une copie antérieure y réside encore
cp -R ../deco-api/src ./app/deco-api
echo "*" >> ./app/deco-api/.gitignore # Important pour éviter que le dossier deco-api soit commité dans l'application principale
```

En temps normal, le fichier `deco-api-proxy.ts` charge le package `deco-api` depuis sa version packagée dans `node_modules`. Mais lorsqu'on souhaite développer `deco-api` on peut changer le fichier `deco-api-proxy.ts` en:

```ts
export * from './deco-api'; // notez le "./" ajouté par rapport à la version originale
```

Une fois cette modification effectuée l'application utilisera la version locale du code `deco-api` et tous les outils de débogage standards pourront être utilisés.

### Valider les changements dans le dossier package original

Il s'agit tout simplement de recopier le code modifié dans le package original:

```sh
rm ./app/deco-api/.gitignore
cp -R ./app/deco-api/* ../deco-api/src
rm -rf ./app/deco-api
```

## Structure description

Au travers de l'usage de décorateurs javascript, `deco-api` facilite la mise en oeuvre d'une API Rest en NodeJS et express.

Le code est structuré de la façon suivante:

* `/decorators` contient le code des décorateurs à proprement parler. On y trouvera par exemple le code de `@model()` dans le fichier `./model.ts` ou les décorateurs de type comment `@type.string` dans `/types/basics.ts`

* `/helpers` contient une série de codes utiles pour résoudre des fonctions spécifiques. On y trouvera notamment la gestion de la base de données (`datastore.ts`, le service pour les emails ou sms, un parser, un utilitaire de date ou encore un helper pour gérer les requêtes `query`)

* `/interfaces` contient des fichiers d'interfaces facilitant le typing (typescript)

* `/middlewares` contient une série de middlewares express destinés à être utilisés sur des routes.

* `/modules` regroupes différents modules fournis par `deco-api`. On y trouvera le module `app` qui gérer les applications, `user` pour la gestion des utilisateurs, `dico` pour la gestion des traductions, `dynamic` pour la gestion des données dynamiques (configurable dynamiquement), `members` pour la gestion des droits d'accès via liste de membres

## Gestion des données

Un des objectifs de `deco-api` est de faciliter la création d'une API REST liée à des modèles définis en typescript avec des décorateurs. Cette mise en oeuvre se fait en 2 étapes:

1. Créer un fichier de modèle pour définir la structure de données
2. Créer un contrôleur pour définir les routes qui interagissent avec le modèle de données

La bonne pratique veut que les fichiers soient regroupés dans des modules par fonction. Supposons que l'on veuille créer un module pour gérer un shop on peut imaginer la structure suivante:

```
/app/shop/
/app/shop/customer.model.ts
/app/shop/customer.controller.ts
/app/shop/order.model.ts
/app/shop/order.controller.ts
/app/shop/product.model.ts
/app/shop/product.controller.ts
````

### Créer un modèle de données avec les décorateurs

Pour créer un model `product`, il faut commencer par créer un fichier de modèle de données, par exemple `product.model.ts`.

```ts
import { model, Model } from '../deco-api-proxy';

@model('shop_products') // 'shop_products' ici sera le nom de la collection mongo liée à ce modèle
export class ProductModel extends Model {

}
```

Ensuite pour définir des propriétés dans le modèle de données on va donner des propriétés typescript à notre modèle et les décorer pour indiquer le type:

```ts
import { model, Model, type, io } from '../deco-api-proxy';

@model('shop_products') // 'shop_products' ici sera le nom de la collection mongo liée à ce modèle
export class ProductModel extends Model {

  @type.string
  @io.all
  public name: string;

  @type.string
  @io.all
  public description: string;

  @type.select({options: ['red', 'blue']})
  @io.all
  public color: 'red' | 'blue';

  @type.boolean
  @io.all
  public inStock: boolean;

  @type.date
  @io.all
  public availableFrom: Date;

}
```

Pour décorer une propriété, on a plusieurs catégories de décorateurs à notre disposition:

1. `@type.` sont les décorateurs de type. Les types de bases fournis par `deco-api` sont: `id`, `string`, `select`, `integer`, `float`, `date`, `boolean`, `array`, `files`, `geojson`, `increment-by-app`, `increment`, `metadata`, `model`, `models`, `object`, `random`
2. `@io.` sont les décorateurs qui définissent la façon dont la propriété est traitée dans le flux d'une requête. Les possibilités sont: 
    1. `@io.input` qui indique qu'il est possible de modifier la valeur de cette propriété via des requêtes POST ou PUT
    2. `@io.output`  qui indique que cette propriété est renvoyée par l'API lors de l'appel à ce modèle
    3. `@io.toDocument` qui indique que cette propriété doit être persistante dans la base de données
    4. `@io.all` qui est un raccourci pour décrire les 3 décorateurs ci-dessus comme il est souvent souhaité d'avoir la combinaison des trois fonctions
3. `@validate.` pour indiquer des critères requis pour la validation de la donnée. Il s'agit de:
    1. `@validate.required`
    2. `@validate.minLength(value: number)`
    3. `@validate.maxLength(value: number)`
    4. `@validate.email`
    5. `@validate.slug` qui requiert une valeur n'utilisant que des caractères alphanumériques et sans accents
    6. `@validate.uniqueByApp` qui requiert une valeur unique pour ce modèle dans toute l'application
4. `@query.` qui regroupe des décorateurs affectant les requêtes sur le modèle. Par exemple:
    1. `@query.searchable` indique que la propriété est incluse lors de recherches sur ce modèle (requêtes avec `&q=<value>` dans le query string)
    2. `@query.filterable({type: 'auto'})` pour indiquer que cette propriété peut être utilisée dans des requêtes filtrées (ex: `&name=<value>)` dans le query string)
    3. `@query.sortable` indique que la propriété peut être utilisée pour effectuer un tri lors de requêtes (ex: `&sort=name` dans le query string)
5. `@mongo.index()` pour créer un index mongo sur cette propriété. Ce décorateur a plusieurs options (voir code source), l'usage le plus standard est: `@mongo.index({type: 'single'})`

### Créer un controller pour définir des routes sur le modèle

Pour commencer nous allons créer un controller basic permettant de faire des requêtes GET, POST, PUT et DELETE sur notre modèle. Créons un fichier pour le contrôleur, par exemple `product.controller.ts`:

```ts 

import { ProductModel } from './product.model';
import { AppMiddleware, AuthMiddleware, ControllerMiddleware } from '../deco-api-proxy';
import { Router, Request, Response, NextFunction } from 'express';

const router: Router = Router();

let controller = new ControllerMiddleware(ProductModel);

// This first block create a GET / route that return *all* elements in this model
// the AppMiddleware.fetchWithPublicKey is a middleware that forces the request to filter elements in the current app (via the apiKey)
// controller.prepareQueryFromReq() applies all the filter, search and sort
// addCountInKey is an optional option to return the total amount of items (without search/filter) in a property (__count) in case one want to build pagination
router.get(
  ControllerMiddleware.getAllRoute(),
  AppMiddleware.fetchWithPublicKey,
  controller.prepareQueryFromReq(),
  controller.getAll(null, {addCountInKey: '__count'})
);

// This block create a GET /:elementId route to fetch a specific element
// The AuthMiddleware.authenticateWithoutError allow the route to try to 
// authenticate the user (then it is available in res.locals.user)
// but if it fails to authenticate it's OK, the user is then not available
// in res.locals.user but the route can still be reached
router.get(
  ControllerMiddleware.getOneRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticateWithoutError,
  controller.getOne()
);

// This block create a POST / route to create a new element
// of this model
// The AuthMiddleware.authenticate requires a valid authenticated user
// to reach this route
router.post(
  ControllerMiddleware.postRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  controller.post()
);

// This block create a PUT /:elementId route to edit an existing element
// The AuthMiddleware.authenticate requires a valid authenticated user
// to reach this route
router.put(
  ControllerMiddleware.putRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  controller.put()
);

// This block create a PUT /:elementId route to edit an existing element
// The AuthMiddleware.authenticate requires a valid authenticated user
// to reach this route
router.delete(
  ControllerMiddleware.deleteRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  controller.delete()
);

export const ProductController: Router = router;
```

Une fois que l'on a un contrôleur prêt pour notre modèle, il est temps de l'inclure dans l'application. Pour cela on va *utiliser* le contrôleur dans l'instance de l'application express. La bonne pratique est d'avoir une variable `app` qui contient l'app et d'écrire: 

```ts

import { ProductController } from './products/product.controller';

// omitted code created and serving the application in app

app.use('/product', ProductController);

```
