type Task = {
  parameters: unknown,
  fn: string,
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void
};

export class AsyncWorker {
  private worker: Worker | null = null;
  private timeout: number | null = null;
  private currentTask: Task | null = null;
  private pendingTasks: Task[] = [];

  private determineScriptPath() {
    try {
      // Throw an error to generate a stack trace
      throw new Error();
    } catch (e) {
      if (e instanceof Error) {
        // Split the stack trace into each line
        const stackLines = e.stack?.split('\n') || [];
        let callerIndex = 0;

        // Now walk though each line until we find a path reference
        for (let i = 0; i < stackLines.length; i++) {
          if (!(/http[s]?:\/\//.exec(stackLines[i])) && !(/file?:\/\//.exec(stackLines[i]))) {
            continue;
          }
          // We skipped all the lines with out an http so we now have a script reference
          // This one is the getScriptPath() call
          // The one after that is the user code requesting the path info (so offset by 1)
          callerIndex = Number(i) + 1;
          break;
        }
        // Now parse the string for each section we want to return
        const pathParts = /(((file|http[s]?):\/\/.+\/)([^/]+\.js)):/.exec(stackLines[callerIndex]);
        if (pathParts) {
          return pathParts[1];
        }
      }
    }

    throw new Error('Could not determine script path');
  }

  runWorkerFunction<T, U>(fn: string, parameters: T): Promise<U> {
    return new Promise((resolve, reject) => {
      this.pendingTasks.push({ fn, parameters, resolve: resolve as (value: unknown) => void, reject });
      this.runNextTaskSupervised();
    });
  }

  private createWorker(fn: string, parameters: unknown) {
    if (this.worker === null) {
      const worker = new Worker(this.determineScriptPath());

      worker.onmessage = (evnt: MessageEvent<{ id: number, error?: string, result?: unknown }>) => {
        const task = this.reset();

        if (task) {
          const { resolve, reject } = task;
          if (evnt.data.error) {
            reject(evnt.data.error);
          } else if (evnt.data.result === null || evnt.data.result === undefined) {
            reject(new Error('Function produced no output'));
          } else {
            resolve(evnt.data.result);
          }
        }

        this.runNextTaskSupervised();
      };

      worker.onerror = (evnt: ErrorEvent) => {
        const task = this.reset();

        worker.terminate();
        this.worker = null;

        if (task) {
          const { reject } = task;
          reject(new Error(evnt.message));
        }

        this.runNextTaskSupervised();
      };

      this.worker = worker;
    }

    this.worker.postMessage({ fn, data: parameters });
  }

  private runNextTaskSupervised() {
    if (this.timeout !== null) {
      // Worker is busy
      return;
    }

    const task = this.pendingTasks.shift();
    if (task === undefined) {
      // No pending task
      return;
    }

    this.timeout = window.setTimeout(() => {
      const task = this.reset();

      this.worker?.terminate();
      this.worker = null;

      if (task) {
        const { reject } = task;
        reject(new Error('timeout'));
      }

      this.runNextTaskSupervised();
    }, 2000);

    const { fn, parameters } = this.currentTask = task;
    this.createWorker(fn, parameters);
  }

  private reset(): Task | null {
    const task = this.currentTask;
    this.currentTask = null;

    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    return task;
  }
}
