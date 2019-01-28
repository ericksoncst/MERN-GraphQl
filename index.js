const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/Event');
const User = require('./models/User');

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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input UserInput {
            email: String!
            password: String!
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
            createUser(userInput: UserInput): User
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
            date: new Date(args.eventInput.date),
            creator: '5c4e3a7bb1e2ee5879fa92c1'
        });
        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc};
            return User.findById('5c4e3a7bb1e2ee5879fa92c1');
          })
          .then(user => {
            if (!user) {
              throw new Error('User not found.');
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },

    createUser: args => {

        return User.findOne({ email: args.userInput.email })
            .then(user => {
                if (user) { throw Error("Email already registered!") }
                return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPass => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPass        
                });
                return user.save();
            })
            .then(result => {
                return { ...result._doc, password: null }
            })
            .catch(err => {
                throw err;
            });
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