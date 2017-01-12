import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

const defaultResponse = { requesting: false, requested: false };

export function _findById(modelSate, { id }) {
  if (!modelSate || isEmpty(modelSate.byId)) {
    return defaultResponse;
  }

  return modelSate.byId[id] || defaultResponse;
}

export function _find(modelSate, params = {}) {
  if (!modelSate) {
    return defaultResponse;
  }

  const collections = modelSate.collections;
  const entry = collections.find(collection => isEqual(collection.params, params));

  if (!entry) {
    return defaultResponse;
  }

  const result = (entry.ids || [])
    .map(id => modelSate.byId[id])
    .filter(record => record);

  return { ...entry, result };
}

export default function createSelectors() {
  return {
    findById({ id }) {
      return _findById(this.getMixinState(), { id });
    },
    findByIdResult({ id }) {
      return _findById(this.getMixinState(), { id }).record || {};
    },
    find(...params) {
      return _find(this.getMixinState(), params);
    },
    findResult(...params) {
      return (_find(this.getMixinState(), params).result || [])
        .map(({ record }) => record);
    }
  };
}
