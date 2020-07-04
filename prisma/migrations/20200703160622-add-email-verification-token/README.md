# Migration `20200703160622-add-email-verification-token`

This migration has been generated by ducwings <ducjava@gmail.com> at 7/3/2020, 4:06:22 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE UNIQUE INDEX "User.emailVerificationToken" ON "public"."User"("emailVerificationToken")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200701193358-add-account..20200703160622-add-email-verification-token
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgres"
-  url = "***"
+  url      = env("DB_URL")
 }
 model Post {
   id        Int     @default(autoincrement()) @id
@@ -31,8 +31,9 @@
   uuid     String  @default(uuid())
   accessToken    String?  @default(uuid())
   email    String
   emailVerified  Boolean @default(false)
+  emailVerificationToken  String? @unique @default(uuid())
   accountAndEmail String? @unique
   username String? @default("")
   password String  @default("")
   name     String? @default("")
```

