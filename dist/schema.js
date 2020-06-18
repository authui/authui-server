"use strict";
exports.__esModule = true;
exports.schema = void 0;
var schema_1 = require("@nexus/schema");
var nexus_prisma_1 = require("nexus-prisma");
var types = require("./types");
exports.schema = schema_1.makeSchema({
    types: types,
    plugins: [nexus_prisma_1.nexusPrismaPlugin()],
    outputs: {
        schema: __dirname + '/../schema.graphql',
        typegen: __dirname + '/generated/nexus.ts'
    },
    typegenAutoConfig: {
        sources: [
            {
                source: '@prisma/client',
                alias: 'client'
            },
            {
                source: require.resolve('./context'),
                alias: 'Context'
            },
        ],
        contextType: 'Context.Context'
    }
});
