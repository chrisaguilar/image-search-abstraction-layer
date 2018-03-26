const { join } = require('path');

const express = require('express');

const { sqlite } = require('./db');
const routes = require('./routes');

const app = express();

sqlite.then(db => db.migrate({ migrationsPath: join(__dirname, 'db', 'migrations') }));

app.use('/api', routes.api);
app.use('/', routes.views);

module.exports = app;
