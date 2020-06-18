"use strict";
exports.__esModule = true;
exports.Query = void 0;
var schema_1 = require("@nexus/schema");
var utils_1 = require("../utils");
exports.Query = schema_1.queryType({
    definition: function (t) {
        t.field('me', {
            type: 'User',
            nullable: true,
            resolve: function (parent, args, ctx) {
                var userId = utils_1.getUserId(ctx);
                return ctx.prisma.user.findOne({
                    where: {
                        id: Number(userId)
                    }
                });
            }
        });
        t.list.field('feed', {
            type: 'Post',
            resolve: function (parent, args, ctx) {
                return ctx.prisma.post.findMany({
                    where: { published: true }
                });
            }
        });
        t.list.field('filterPosts', {
            type: 'Post',
            args: {
                searchString: schema_1.stringArg({ nullable: true })
            },
            resolve: function (parent, _a, ctx) {
                var searchString = _a.searchString;
                return ctx.prisma.post.findMany({
                    where: {
                        OR: [
                            {
                                title: {
                                    contains: searchString || ''
                                }
                            },
                            {
                                content: {
                                    contains: searchString
                                }
                            },
                        ]
                    }
                });
            }
        });
        t.field('post', {
            type: 'Post',
            nullable: true,
            args: { id: schema_1.intArg() },
            resolve: function (parent, _a, ctx) {
                var id = _a.id;
                return ctx.prisma.post.findOne({
                    where: {
                        id: Number(id)
                    }
                });
            }
        });
    }
});
