import * as acorn from 'acorn';
global.acorn = acorn;
import { Interpreter } from '../lib/js-interpreter/interpreter.js';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

self.onerror = function(e: string | Event) {
  if (e instanceof Error) {
    returnValue(undefined, e.message);
  }
  close();
};

self.onmessage = function(e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'Function') {
    // Aggregation and Computed Attributes functions
    try {
      const task = e.data as WorkerFunctionRequest;
      const myInterpreter = new Interpreter(`(function() {
          var __user_function = ${task.fn};
          return __user_function(${JSON.stringify(task.data)});
      })()`);
      myInterpreter.run();
      if (myInterpreter.value.properties) {
        returnValue(myInterpreter.value.properties);
      } else {
        returnValue(myInterpreter.value);
      }
    } catch (e) {
      if (e instanceof Error) {
        returnValue(undefined, e.message);
      }
    }
  } else if (e.data.type === 'Release') {
    // Fetch latest release of plugin
    void (async () => {
      try {
        const result = await self.fetch('https://api.github.com/repos/INCYDE-GmbH/drawio-plugin-attackgraphs/releases/latest');
        const json = await result.json();
        returnValue(json);
      } catch (e) {
        if (e instanceof Error) {
          returnValue(undefined, e.message);
        }
      }
    })();
  } else {
    returnValue(undefined, 'Type of request not specified!');
  }
}

function returnValue(result?: any, error?: string) {
  if (result) {
    const response: WorkerResponse = { result: result };
    self.postMessage(response);
  } else if (error) {
    const response: WorkerResponse = { error: error };
    self.postMessage(response);
  } else {
    const response: WorkerResponse = { error: 'Error in Web Worker!' };
    self.postMessage(response);
  }
}
