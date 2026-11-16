import * as migration_20261115_093858_initial from './20261115_093858_initial';
import * as migration_20261115_100000_search_index from './20261115_100000_search_index';

export const migrations = [
  {
    up: migration_20261115_093858_initial.up,
    down: migration_20261115_093858_initial.down,
    name: '20261115_093858_initial'
  },
  {
    up: migration_20261115_100000_search_index.up,
    down: migration_20261115_100000_search_index.down,
    name: '20261115_100000_search_index'
  },
];
