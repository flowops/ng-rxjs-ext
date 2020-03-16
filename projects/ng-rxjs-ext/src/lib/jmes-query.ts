import jmespath from 'jmespath';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const jmesQuery = (query: string) => (source: Observable<any>) => {
  return source.pipe(map(data => jmespath.search(data, query)));
};
