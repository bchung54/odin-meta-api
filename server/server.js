const database = require('../config/mongoConfig');
const createApp = require('../app');

const app = createApp(database);
const server = app.listen(3000, () => console.log('listening on port 3000'));

module.exports = { app, server };
