"use strict";
exports.__esModule = true;
var cors = require("cors");
var graphql_yoga_1 = require("graphql-yoga");
var permissions_1 = require("./permissions");
var schema_1 = require("./schema");
var context_1 = require("./context");
var PORT = process.env.PORT || 4001;
var server = new graphql_yoga_1.GraphQLServer({
    schema: schema_1.schema,
    context: context_1.createContext,
    middlewares: [permissions_1.permissions]
});
server.express.use(cors());
// server.express.options('*', cors());
server.start({
    port: PORT,
    cors: {
    // origin: '*'
    // credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
    }
}, function () {
    return console.log("\uD83D\uDE80 Server ready at: http://localhost:" + PORT + "\n\u2B50\uFE0F See sample queries: http://pris.ly/e/ts/graphql-auth#using-the-graphql-api");
});
