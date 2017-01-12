# redux-models-mixin-crud

Mixin for [redux-models](https://github.com/vshushkov/redux-models). Mixin adds CRUD-methods to models.

## Usage

**methods.js**

```js
export default {
  create() { ... POST / },
  updateById() { ... PATCH /:id },
  deleteById() { ... DELETE /:id },
  find() { ... GET / }
  findById() { ... GET /:id }
};
```

**user.js**

```js
import { createModel } from 'redux-models-creator';
import crudMixin from 'redux-models-mixin-crud';
import methods from './methods';

const user = createModel({
  name: 'user',
  mixins: [
    crudMixin({ methods })
  ]
});

export const reducer = user.reducer;
export default user;
```

Or you may pass [`to-api`](https://github.com/vshushkov/to-api) instance:

**api.js**

```js
import apiCreator from 'to-api';

const creator = apiCreator({ baseUrl: process.env.BASE_URL });
export default creator;
```

**user.js**

```js
import { createModel } from 'redux-models-creator';
import crudMixin from 'redux-models-mixin-crud';
import api from './api';

const baseUrl = `${api.baseUrl}/users`;

const user = createModel({
  name: 'user',
  mixins: [
    crudMixin({ apiCreator: api, baseUrl })
  ]
})

export const reducer = user.reducer;
export default user;
```