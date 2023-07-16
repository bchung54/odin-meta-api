const database = require('../config/mongoConfigTesting');
const createApp = require('../app');

const app = createApp(database);
const server = app.listen(8080, () => console.log('listening on port 8080'));

module.exports = { app, server };
