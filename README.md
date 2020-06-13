# <img src="./tools/logo-png-200.png" height="50" /> AuthUI Server

Authentication-as-a-service

- [Live Example](https://codesandbox.io/s/authui-example-8jswg?module=/src/LoginPage/LoginPage.tsx)
- API endpoint may change but data will be persisted.

<img src="./tools/diagram.png" />

### Motivations

When starting a new project, it takes some effort to implement Login / Sign-up screens. Often times we have to repeat the same implementation again and again.

- Authentication should be simple to remove frictions to get users started.
- AuthUI takes care of user login & sign up logic.
- Save dev time to focus on main ideas.

<img src="./tools/authui-demo-1.gif" />

- [Live Example](https://codesandbox.io/s/authui-example-8jswg?module=/src/LoginPage/LoginPage.tsx)

### Commands

Node 13.x
yarn 1.22.x

server.ts - update PORT

Prepare Database and Seed data:
```
$ yarn generate
$ yarn seed
```

Run Dev:

```
$ yarn dev
```

### Application flows:

- Include the Login Component into the main app and customize it: [Example](https://codesandbox.io/s/authui-example-8jswg?module=/src/LoginPage/LoginPage.tsx)
- The Login Component will make requests to AuthUI login or signup graphql endpoint.
- AuthUI endpoints will respond with a JWT token (contains userId).

### Contributions

Please open pull requests. Any contribution is welcome!