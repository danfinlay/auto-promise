type AutoOptions = {
  [key: string]: AutoFuncArr,
}

interface Entry {
  name: string;
  dependents: Entry[];
  needs: string[];
  promise?: Promise<unknown>;
  resolve?: Function;
  reject?: Function;
  func?: Function;
}
type Dag = { [key:string]: Entry };
type AutoFuncArr = Array<string | AutoFunction>; 

type AutoFunction = (needs: AutoResults) => unknown;
type AutoResults = {[key:string]: unknown};

export default function autoPromise (opts:AutoOptions): Promise<AutoResults> {

  let result: AutoResults = {};
  let immediateStart: string[] = [];

  let dag: Dag = {};
  let promises: {[task:string]: Promise<unknown>} = {};

  // Setup
  for (let key in opts) {
    const func = opts[key].pop();
    const needsDirty = opts[key];
    const needs: string[] = [];
    needsDirty.forEach((need) => {
      if (typeof need === 'string') {
        needs.push(need);
      }
    })

    if (typeof func !== 'function') {
      throw new Error(`The last member of each task array must be a function.`);
    }
    const entry:Entry = {
      name: key,
      dependents: [],
      needs,
      func,
    };
    dag[key] = entry;

  }

  // populate dependents arrays
  for (const key in dag) {
    const entry:Entry = dag[key];
    entry.needs.forEach((need) => {
      dag[need].dependents.push(entry);
    });
  }

  return new Promise((res, rej) => {
    for (let key in dag) {
      const entry = dag[key];
      const { needs, func } = entry;

      // Start the methods with no dependencies first
      if (needs.length === 0 && typeof func === 'function') {
        initiate(entry, res, rej, dag);
      }
    } 
  });

  function initiate (entry:Entry, res: Function, rej: Function, dag: Dag) {
    const { func } = entry;
    if (!func) {
      throw new Error('a function was not defined for ' + entry.name);
    }
    const promise = Promise.resolve(func(result));
    entry.promise = promise;
    promise
    .then((value: unknown) => {
      result[entry.name] = value;

      // Check if this was the last item
      if (entry.dependents.length === 0) {
        if (Object.keys(dag).length === Object.keys(result).length) {
          res(result);
        }       
      }

      // Start any dependents that are ready
      entry.dependents.forEach((dependent) => {
        let satisfied:boolean = true;
        dependent.needs.forEach((need) => {
          if (!(need in result)) {
            satisfied = false;
            const entry:Entry = dag[need];
            initiate(entry, res, rej, dag);
          }
        });
        if (satisfied) {
          // If all are satisfied then return
          if (Object.keys(dag).length === Object.keys(result).length) {
            res(result);
          } else {
            initiate(dependent, res, rej, dag);
          }
        }
      });
      return value;
    })
    .catch((reason) => {
      rej(reason);
    });
  }
}
