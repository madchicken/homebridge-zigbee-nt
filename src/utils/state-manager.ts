export interface Store<K, V extends {}> {
  setState(id: K, state: V): void;

  getStete(id: K): V;
}

class StateManager<K, V extends {}> implements Store<K, V> {
  private readonly store: Map<K, V> = new Map<K, V>();

  setState(id: K, state: V): void {
    const value = this.store.has(id) ? { ...this.store.get(id), ...state } : { ...state };
    this.store.set(id, value);
  }

  getStete(id: K): V {
    if (!this.store.has(id)) {
      this.setState(id, {} as V);
    }
    return this.store.get(id);
  }
}

export function createStore<K = string, V = any>(): Store<K, V> {
  return new StateManager();
}
