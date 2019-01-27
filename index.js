const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return ['SOAD SHOW', 'JINJER SHOW', 'REACT MEETING'];
        },

        createEvent: args => {
            const eventName = args.name;
            return eventName;
        }

    },
    graphiql: true
}));

const PORT = 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));