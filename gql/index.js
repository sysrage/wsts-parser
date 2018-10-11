const { readdirSync, statSync, writeFileSync } = require('fs');
const path = require('path');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql-tag');
const { buildASTSchema } = require('graphql');

const app = express();
app.use(cors());

const schema = buildASTSchema(gql`
  type Query {
    hello: String
    logDirs: [String]
    write(name: String): Boolean
  }
`);

// const baseDir = 'Z:\\Benchmark Data\\In Progress Benchmark Data\\';
const baseDir = '../scanner/sample/';

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

const rootValue = {
  hello: () => 'Hello world!',
  logDirs: () => getDirs(),
  write: ({ name }) => testWrite(name)
}

app.use('/graphql', graphqlHTTP({ schema, rootValue }));
app.use(morgan('dev'));

const port = process.env.PORT || 4000
app.listen(port)
console.log(`Running GraphQL server at http://localhost:${port}/graphql`)
