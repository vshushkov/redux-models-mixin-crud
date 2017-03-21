import createReducer from './reducer';
import createSelectors from './selectors';

export const name = 'crud';
export const notImplemented = () => {
  throw new Error('Method not implemented');
};

export default function ({ apiCreator = null, baseUrl = null, methods = {} } = {}) {
  return {
    name,
    createMethods: () => {
      return apiCreator && typeof apiCreator.create === 'function' ?
        apiCreator.create({
          create: 'POST /',
          updateById: 'PUT /:id',
          patchById: 'PATCH /:id',
          deleteById: 'DELETE /:id',
          find: 'GET /',
          findById: 'GET /:id'
        }, { baseUrl }) :
        Object.assign({
          create: notImplemented,
          updateById: notImplemented,
          patchById: notImplemented,
          deleteById: notImplemented,
          find: notImplemented,
          findById: notImplemented
        }, methods);
    },
    createReducer,
    createSelectors
  }
};
