const workers = require('./index');

workers.forEach((w) => {
    w.replay()
});