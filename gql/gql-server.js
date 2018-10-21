const { ApolloServer, gql } = require('apollo-server');
const { readdirSync, statSync, writeFileSync } = require('fs');
const path = require('path');

// ************************
const baseDir = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\';
// const baseDir = '../scanner/sample/';

const getDirs = () => {
  const dirs = p => readdirSync(p).filter(f => statSync(path.join(p, f)).isDirectory());
  return dirs(baseDir);
}

const testWrite = (name) => {
  try {
    writeFileSync(path.join(__dirname, '../scanner/sample/test'), name);
  } catch (err) {
    return err;
  }
  return true;
}
// ************************

const typeDefs = gql`
  type Query {
    hello: String
    logDirs: [String]
    write(name: String): Boolean
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    logDirs: () => getDirs(),
    write: ({ name }) => testWrite(name)
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
