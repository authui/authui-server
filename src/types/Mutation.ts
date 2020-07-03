import { intArg, mutationType, stringArg } from '@nexus/schema'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { APP_SECRET, getUserId } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import { omit } from 'lodash'

const path = require('path');
const result = require('dotenv').config({ path: path.resolve(__dirname, '../../prisma/.env') });
if (result.error) {
  throw result.error
} else {
  console.log('- .env loaded');
}

const mailgun = require('mailgun.js');
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

// In Progress - build URL to verify email:
// const emailAfterSignUp = ({ accountName, toEmail }:{ accountName: string, toEmail: string }) => {
//   const url ='http://nothing.com';
//   mg.messages.create(process.env.MAILGUN_DOMAIN, {
//     from: `Registration <noreply@${process.env.MAILGUN_DOMAIN}>`,
//     to: [toEmail],
//     subject: "Thank you for registering",
//     text: `Thanks for registering with ${accountName} \n\nPlease click on the following link to verify your email address: \n${url}`
//     // html: "<h1>Testing some Mailgun awesomness!</h1>"
//   })
//   .then((msg: string) => console.log(msg)) // logs response data
//   .catch((err: any) => console.log(err)); // logs any error
// }

const emailForPasswordReset = ({ accountName, toEmail, newPassword }:{ accountName: string, toEmail: string, newPassword: string }) => {
  mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `Registration <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: [toEmail],
    subject: "Your temporary password",
    text: `You have just made a request to reset your password for ${accountName} \n\nBelow is your new password: \n${newPassword}`
    // html: "<h1>Testing some Mailgun awesomness!</h1>"
  })
  .then((msg: string) => console.log(msg)) // logs response data
  .catch((err: any) => console.log(err)); // logs any error
}

const upsertAccount = async ({ ctx, accountId, email }: { ctx: any, accountId: string, email: string }) => {
  const dbAccount = await ctx.prisma.account.findOne({
    where: {
      accountId
    },
  })
  if (!dbAccount) {
    // create new Account
    const account = await ctx.prisma.account.create({
      data: {
        accountId,
        name: accountId,
        ownerEmail: email.toLowerCase()
      },
    })
  }
}

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
        await upsertAccount({ ctx, accountId: accountId || '', email })
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
        const lastUA = ctx.request.headers['user-agent'];
        const lastReferer = ctx.request.headers['referer'];
        await ctx.prisma.user.update({
          where: { id: user.id ?? -1 },
          data: {
            accessToken,
            loginCount: (user.loginCount || 0) + 1,
            lastLogin: new Date(), // new Date().toISOString().replace('T', ' ').substr(0, 19)
            lastUA,
            lastReferer
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

    t.field('resetPassword', {
      type: 'AuthPayload',
      args: {
        accountId: stringArg(),
        email: stringArg({ nullable: false })
      },
      resolve: async (_parent, { accountId, email }, ctx) => {
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
        const newPassword = uuidv4();
        await ctx.prisma.user.update({
          where: { id: user.id ?? -1 },
          data: {
            password: await hash(newPassword, 10),
            resetAt: new Date()
          },
        })
        emailForPasswordReset({ accountName: (accountId || ''), toEmail: email, newPassword });
        return {
          token: sign(
            { ...omit(user, 'id', 'accountAndEmail', 'password'), accessToken: '' },
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
