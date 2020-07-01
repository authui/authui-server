import { intArg, mutationType, stringArg } from '@nexus/schema'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'
import { v4 as uuidv4 } from 'uuid'
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
        // create new User
        const user = await ctx.prisma.user.create({
          data: {
            accountId,
            name,
            email: email.toLowerCase(),
            accountAndEmail: `${accountId}_${email.toLowerCase()}`,
            accessToken,
            password: hashedPassword,
          },
        })
        return {
          token: sign(
            { ...omit(user, 'id', 'accountAndEmail', 'password'), accessToken },
            APP_SECRET
          ),
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
      resolve: async (_parent, { accountId, email, password }, ctx) => {
        // console.log('ctx', ctx.request.headers['user-agent']); // 'referer'
        const user = await ctx.prisma.user.findOne({
          where: {
            accountAndEmail: `${accountId}_${email.toLowerCase()}`,
          },
        })
        if (!user) {
          throw new Error(`No user found for email: ${email}`)
        }
        if (!user.active) {
          throw new Error(`User is not active.`)
        }
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          throw new Error('Invalid password')
        }
        // update User - generate & update login token
        const accessToken = uuidv4()
        await ctx.prisma.user.update({
          where: { id: user.id ?? -1 },
          data: {
            accessToken,
            loginCount: (user.loginCount || 0) + 1,
            lastLogin: new Date() // new Date().toISOString().replace('T', ' ').substr(0, 19)
          },
        })
        return {
          token: sign(
            { ...omit(user, 'id', 'accountAndEmail', 'password'), accessToken },
            APP_SECRET
          ),
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
