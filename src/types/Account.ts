import { objectType } from '@nexus/schema'

export const User = objectType({
  name: 'Account',
  definition(t) {
    t.model.accountId(),
    t.model.apiKey(),
    t.model.name(),
    t.model.ownerEmail(),
    t.model.createdAt(),
    t.model.updatedAt()
  },
})
