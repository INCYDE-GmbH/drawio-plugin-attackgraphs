if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  require('./worker')
} else {
  require('./plugin')
}
