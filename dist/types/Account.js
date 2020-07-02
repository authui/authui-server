"use strict";
exports.__esModule = true;
exports.User = void 0;
var schema_1 = require("@nexus/schema");
exports.User = schema_1.objectType({
    name: 'Account',
    definition: function (t) {
        t.model.accountId(),
            t.model.apiKey(),
            t.model.name(),
            t.model.ownerEmail(),
            t.model.createdAt(),
            t.model.updatedAt();
    }
});
