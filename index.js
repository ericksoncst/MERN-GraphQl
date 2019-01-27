const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/Event');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc };
                    });
                })
                .catch(err => {
                    throw err;
                });
        },

    createEvent: args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date)
        });
        return event.save()
            .then(result => {
                return { ...result._doc };
            })
            .catch(err => { throw err });
        return event;
        }
    }, 

    graphiql: true
}));

const PORT = 5000;

mongoose.connect(`
    ${process.env.MONGO_URI}`,
    { useNewUrlParser: true })
    .then(
        app.listen(PORT, console.log(`Server running on port ${PORT}`))
    )
    .catch(err => console.log(err));