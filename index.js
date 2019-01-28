const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

const PORT = 5000;

mongoose.connect(`
    ${process.env.MONGO_URI}`,
    { useNewUrlParser: true })
    .then(
        app.listen(PORT, console.log(`Server running on port ${PORT}`))
    )
    .catch(err => console.log(err));