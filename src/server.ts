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
