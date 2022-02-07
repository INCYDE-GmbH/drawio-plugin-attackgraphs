import * as acorn from 'acorn';
global.acorn = acorn;
import { Interpreter } from '../lib/js-interpreter/interpreter.js';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

interface Request { fn: string, data: any }
// interface Response { result?: any, error?: Error };

self.onerror = function(e: string | Event) {
  if (e instanceof Error) {
    postMessage({ error: e.message });
  }
  close();
};

self.onmessage = function(e: MessageEvent<Request>) {
  try {
    const task = e.data;
    const myInterpreter = new Interpreter(`(function() {
        var __user_function = ${task.fn};
        return __user_function(${JSON.stringify(task.data)});
    })()`);
    myInterpreter.run();
    if (myInterpreter.value.properties) {
      postMessage({ result: myInterpreter.value.properties });
    } else {
      postMessage({ result: myInterpreter.value });
    }
  } catch (e) {
    if (e instanceof Error) {
      postMessage({ error: e.message });
    }
  }
}
