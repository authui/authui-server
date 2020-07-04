import * as cors from "cors";
import { GraphQLServer } from 'graphql-yoga'
import { permissions } from './permissions'
import { schema } from './schema'
import { createContext } from './context'

const PORT = process.env.PORT || 4001

const server = new GraphQLServer({
  schema,
  context: createContext,
  middlewares: [permissions]
})
server.express.use(cors());
// server.express.options('*', cors()); // enable pre-flight across-the-board

// TODO: use "unfetch" to POST to graphql-verify
server.express.get('/emailVerificationPage', async (req, res, done) => {
  res.type('html');
  res.end(`
<!DOCTYPE html>
<html>
<head>
	<title>Email Verification</title>
  <style>body { font-size: 1.2em; } .container { text-align: center; padding: 100px; }</style>
  <script src="https://unpkg.com/unfetch/polyfill"></script>
</head>
<body>
  <h3 id="mydiv" class="container">
    Thank you for verifying your email!
  </h3>

  <script type="text/javascript">
    window.onload = () => {
      const emailVerificationToken = window.location.search.split('=')[1];
      console.log('emailVerificationToken', emailVerificationToken);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Request-Type': 'GraphQL' },
        body: JSON.stringify({ "query": "mutation { verifyEmail( emailVerificationToken: \\"\" + emailVerificationToken + "\\" ) { token } }" })
      }).then( r => {
        // return r.json();
      })
    }
  </script>
</body>
</html>
  `);
});

server.start({
  port: PORT,
  cors: {
    // origin: '*'
    // credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  }
}, () =>
console.log(
  `🚀 Server ready at: http://localhost:${PORT}\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-auth#using-the-graphql-api`,
))
