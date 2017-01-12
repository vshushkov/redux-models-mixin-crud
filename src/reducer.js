import isEqual from 'lodash/isEqual';

/**
 * State schema:
 *
 * {
 *   byId: {
 *     [id]: {
 *       record: { entity object },
 *       requested: true,
 *       requesting: false,
 *       error: {}
 *     }
 *   },
 *   collections: [
 *     {
 *       params: { "primary key" },
 *       requested: true,
 *       requesting: false,
 *       error: {},
 *       ids: [1, 2, 3, 4, ...]
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * @return {Function}
 */
export default function createReducer(model, { CREATE_SUCCESS,
  UPDATE_BY_ID_START, UPDATE_BY_ID_SUCCESS, UPDATE_BY_ID_ERROR,
  DELETE_BY_ID, DELETE_BY_ID_SUCCESS, DELETE_BY_ID_ERROR,
  FIND_START, FIND_SUCCESS, FIND_ERROR,
  FIND_BY_ID_START, FIND_BY_ID_SUCCESS, FIND_BY_ID_ERROR }
) {

  /*
   * Initial states
   */

  const byIdInitialState = {};

  const byIdDocumentInitialState = {
    requesting: false,
    requested: false,
    error: null,
    record: null
  };

  const collectionInitialState = {
    requesting: false,
    params: {},
    ids: [],
    error: null
  };

  const collectionsInitialState = [];

  const modelInitialState = {
    byId: byIdInitialState,
    collections: collectionsInitialState
  };

  /*
   * Reducers
   */

  function byIdReducer(state = byIdInitialState, action) {
    let id = null;

    if (action.payload && action.payload[0] && action.payload[0].id) {
      // byId methods (FIND_BY_ID, UPDATE_BY_ID, DELETE_BY_ID)
      id = action.payload[0].id;
    } else if (action.meta && action.meta.id) {
      // try to find id in response
      id = action.meta.id;
    }

    const response = action.meta || null;

    switch (action.type) {
      case FIND_SUCCESS:
        return {
          ...state,
          ...(action.meta.reduce((records, record) => {
            records[record.id] = {
              ...byIdDocumentInitialState,
              record,
              error: null,
              requesting: false,
              requested: true
            };

            return records;
          }, {}))
        };

      case FIND_BY_ID_START:
      case UPDATE_BY_ID_START:
        return {
          ...state,
          [id]: {
            ...(state[id] || byIdDocumentInitialState),
            requesting: true
          }
        };

      case CREATE_SUCCESS:
      case FIND_BY_ID_SUCCESS:
      case UPDATE_BY_ID_SUCCESS:
        return {
          ...state,
          [id]: {
            ...(state[id] || byIdDocumentInitialState),
            requesting: false,
            requested: true,
            record: response,
            error: null
          }
        };

      case FIND_BY_ID_ERROR:
        return {
          ...state,
          [id]: {
            ...(state[id] || byIdDocumentInitialState),
            requesting: false,
            requested: true,
            error: response
          }
        };

      case DELETE_BY_ID_SUCCESS:
        return {
          ...state,
          [id]: undefined
        };

      default:
        return state
    }
  }

  /*
   * Note: fetchTime of null means "needs fetch"
   */
  function collectionReducer(state = collectionInitialState, action) {
    const params = action.payload;
    const response = action.meta || null;

    switch (action.type) {
      case FIND_START:
        return {
          ...state,
          requesting: true,
          params: params,
          error: null
        };

      case FIND_SUCCESS:
        return {
          ...state,
          requesting: false,
          requested: true,
          params: params,
          ids: response.filter(record => record).map(record => record.id),
          error: null
        };

      case FIND_ERROR:
        return {
          ...state,
          requesting: false,
          params: params,
          error: response
        };

      default:
        return state
    }
  }

  function collectionsReducer(state = collectionsInitialState, action) {
    const params = action.payload;

    switch (action.type) {

      case FIND_START:
      case FIND_SUCCESS:
      case FIND_ERROR:
        const findIndex = state.findIndex(collection => isEqual(collection.params, params));

        if (findIndex === -1) {
          return [...state, collectionReducer(collectionInitialState, action)];
        }

        return [
          ...state.slice(0, findIndex),
          collectionReducer(state[findIndex], action),
          ...state.slice(findIndex + 1, state.length)
        ];

      case CREATE_SUCCESS:
      case DELETE_BY_ID_SUCCESS:
        return state.map(item => ({ ...item }));

      default:
        return state
    }
  }

  return function crudReducer(state = modelInitialState, action) {
    switch (action.type) {

      case FIND_START:
      case FIND_SUCCESS:
      case FIND_ERROR:
        return {
          ...state,
          collections: collectionsReducer(state.collections, action),
          byId: byIdReducer(state.byId, action)
        };

      case FIND_BY_ID_START:
      case FIND_BY_ID_SUCCESS:
      case FIND_BY_ID_ERROR:
        return {
          ...state,
          byId: byIdReducer(state.byId, action)
        };

      case CREATE_SUCCESS:
        return {
          ...state,
          collections: collectionsReducer(state.collections, action),
          byId: byIdReducer(state.byId, action)
        };

      case UPDATE_BY_ID_START:
      case UPDATE_BY_ID_SUCCESS:
      case UPDATE_BY_ID_ERROR:
        return {
          ...state,
          byId: byIdReducer(state.byId, action)
        };

      case DELETE_BY_ID:
      case DELETE_BY_ID_SUCCESS:
      case DELETE_BY_ID_ERROR:
        return {
          ...state,
          byId: byIdReducer(state.byId, action),
          collections: collectionsReducer(state.collections, action)
        };

      default:
        return state
    }
  }
}
