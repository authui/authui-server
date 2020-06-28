import { intArg, mutationType, stringArg } from '@nexus/schema'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'
import { v4 as uuidv4 } from 'uuid';
import { omit } from 'lodash'

export const Mutation = mutationType({
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        accountId: stringArg(),
        name: stringArg(),
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { accountId, name, email, password }, ctx) => {
        const hashedPassword = await hash(password, 10)
        const accessToken = uuidv4()
        const user = await ctx.prisma.user.create({
          data: {
            accountId,
            name,
            email,
            accessToken,
            password: hashedPassword,
          },
        })
        return {
          // token: sign({ userId: user.uuid, email: user.email }, APP_SECRET),
          token: sign({ ...omit(user, 'id', 'password'), accessToken }, APP_SECRET),
          user,
        }
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        accountId: stringArg({ nullable: false }),
        email: stringArg({ nullable: false }),
        password: stringArg({ nullable: false }),
      },
      resolve: async (_parent, { email, password }, ctx) => {
        const user = await ctx.prisma.user.findOne({
          where: {
            email,
          },
        })
        if (!user) {
          throw new Error(`No user found for email: ${email}`)
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          throw new Error('Invalid password')
        }
        // generate & update login token
        const accessToken = uuidv4()
        await ctx.prisma.user.update({
          where: { id: user.id ?? -1 },
          data: { accessToken },
        })
        return {
          // token: sign({ userId: user.uuid, email: user.email }, APP_SECRET),
          token: sign({ ...omit(user, 'id', 'password'), accessToken }, APP_SECRET),
          user,
        }
      },
    })

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg({ nullable: false }),
        content: stringArg(),
      },
      resolve: (parent, { title, content }, ctx) => {
        const userId = getUserId(ctx)
        if (!userId) throw new Error('Could not authenticate user.')
        return ctx.prisma.post.create({
          data: {
            title,
            content,
            published: false,
            author: { connect: { id: Number(userId) } },
          },
        })
      },
    })

    t.field('deletePost', {
      type: 'Post',
      nullable: true,
      args: { id: intArg({ nullable: false }) },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.post.delete({
          where: {
            id,
          },
        })
      },
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: { id: intArg() },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.post.update({
          where: { id: id ?? -1 },
          data: { published: true },
        })
      },
    })
  },
})
