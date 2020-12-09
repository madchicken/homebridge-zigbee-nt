import { applyMiddleware, compose, createStore, Store, StoreEnhancer } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { AppState, rootReducer } from './reducers';

export default function configureStore(preloadedState): Store<AppState> {
  const middlewares = [thunkMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers: StoreEnhancer = compose(...enhancers);

  return createStore(rootReducer, preloadedState, composedEnhancers);
}
