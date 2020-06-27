import { objectType } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.accountId()
    t.model.id()
    t.model.uuid()
    t.model.accessToken()
    t.model.name()
    t.model.email()
    t.model.emailVerified()
    t.model.username()
    t.model.phone()
    t.model.phoneVerified()
    t.model.active()
    t.model.posts({ pagination: false })
    t.model.picUrl()
    t.model.loginCount()
    t.model.lastLogin()
    t.model.lastLogin()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.resetAt()
    t.model.active()
  },
})
