"use strict";
exports.__esModule = true;
exports.Post = void 0;
var schema_1 = require("@nexus/schema");
exports.Post = schema_1.objectType({
    name: 'Post',
    definition: function (t) {
        t.model.id();
        t.model.published();
        t.model.title();
        t.model.content();
        t.model.author();
    }
});
