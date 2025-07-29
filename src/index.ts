if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./worker')
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./plugin')
}
