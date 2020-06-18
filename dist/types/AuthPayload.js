"use strict";
exports.__esModule = true;
exports.AuthPayload = void 0;
var schema_1 = require("@nexus/schema");
exports.AuthPayload = schema_1.objectType({
    name: 'AuthPayload',
    definition: function (t) {
        t.string('token');
        t.field('user', { type: 'User' });
    }
});
