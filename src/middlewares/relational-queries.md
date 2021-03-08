# Directions

Relations on a model can have two distincts directions:

* 'original' => meaning that the relation comes from a @model or @models decorator directly on the model
* 'detected' => meaning that it has been detected from a @model or @models decorator on another models, pointing to this one

In case of Core Models, the relations are stored in an Array in the /decorators/type/models.ts file:

```js
export interface DetectedModelRelation {
  fromModel: typeof Model;
  toModel: typeof Model;
  key: string;
  type: 'model' | 'models';
}

export let relations: Array<DetectedModelRelation> = [];
```

For Dynamic Data, the relations are detected on each requests, based on DynamicConfig models.

# Filtering Relational Models

In order to filter on data accross models, we work with these different steps:

1. Find out all relations (orignals and detected)
2. If we find query (in req.query) linking to these models, we fetch these models using the query params
3. Then we do a Query.addQuery() on the original query to filter by this relation

Warning: in the situation where a model has several detected relations between the same models, the OPERAND between the added query will be a AND. This can lead to unwanted results where a filter impacts limits too much the results.

For step 2, we have a common config such as:

```js
export interface RelatedModelFilterQueryConfig {
  model: typeof Model,
  deco: Deco,
  key: string;
  direction: 'original' | 'detected';
  baseQuery?: Query;
  multiple: boolean;
}

let relatedQueriesSettings: Array<RelatedModelFilterQueryConfig> = [];
```

The goal of this Array is to have settings that can be altered by Models that inherit the base Model class such as the DynamicDatas.

The construction of the `relatedQueriesSettings` array goes through the following methods:

* `findOriginalModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>>`
* `findDetectedModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>>`

And then:

* `placeRelationalFiltersInReq(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>);`

# Exemple with Core Models

DataModel

```
@model('data')

@type.id
_id: ObjectId;

@model({model: Data2Model})
data2Id: ObjectId;

@models({model: Data2Model})
data2Ids: Array<ObjectIds>;

@type.string
name: string
```

Data2Model

```

@model('data2')

@type.id
_id: ObjectId;

@model({model: DataModel})
backDataId: ObjectId;

@models({model: DataModel})
backDataIds: Array<ObjectIds>;

@type.string
name: string
```

/data?data2.name=Ben // going through the detected relation (based on modelName)
/data?data2Id.name=Thomas // going through the origianal relation (based on @model property)


/data2?data.name=Thomas
/data2?data.name=Thomas

# Exemple with Dynamic Data Models

