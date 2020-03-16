import { Observable } from 'rxjs';
import { path, mergeDeepRight, assocPath } from 'ramda';
import { debounceTime, map } from 'rxjs/operators';

export const transformToShape = (mapper: { [key: string]: any }) => (source: Observable<any>) => {
  return source.pipe(
    debounceTime(800),
    map(formValues => {
      return Object.entries(mapper).reduce((acc, [formPath, storePath]) => {
        const valueExists =
          path(formPath.split('.'), formValues) !== undefined && path(formPath.split('.'), formValues) !== null;
        if (typeof storePath === 'string') {
          return valueExists
            ? mergeDeepRight(acc, assocPath(storePath.split('.'), path(formPath.split('.'), formValues), {}))
            : acc;
        } else if (Array.isArray(storePath) && typeof storePath[0] === 'string') {
          return storePath.reduce((innerAcc, innerStorePath) => {
            const innerObj = valueExists
              ? mergeDeepRight(
                  innerAcc,
                  assocPath(innerStorePath.split('.'), path(formPath.split('.'), formValues), {})
                )
              : innerAcc;
            return mergeDeepRight(acc, innerObj);
          }, {});
        } else if (Array.isArray(storePath) && typeof storePath[0] === 'function') {
          const [func, pathToStore] = storePath;
          const transformed = func(path(formPath.split('.'), formValues));
          return valueExists ? mergeDeepRight(acc, assocPath(pathToStore.split('.'), transformed, {})) : acc;
        } else if (Array.isArray(storePath) && Array.isArray(storePath[0])) {
          return storePath.reduce((inner1, funcToPathArray) => {
            const [func, pathToStore] = funcToPathArray;
            const transformed = func(path(formPath.split('.'), formValues));
            const innerObj = valueExists
              ? mergeDeepRight(inner1, assocPath(pathToStore.split('.'), transformed, {}))
              : inner1;
            // const innerObj1 = valueExists
            //   ? R.mergeDeepRight(inner1, R.assocPath(pathToStore.split('.'), R.path(formPath.split('.'), formValues), {}))
            //   : inner1;
            return mergeDeepRight(acc, innerObj);
          }, {});
        }
      }, {});
    })
  );
};
