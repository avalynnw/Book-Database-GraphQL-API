// Define the query and mutation functionality to work with the Mongoose models.

// 		**Hint**: Use the functionality in the `user-controller.js` as a guide.
const { User } = require("../models");
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      const foundUser = await User.findOne({
        _id: context.user._id,
      });

      if (!foundUser) {
        throw new AuthenticationError("Cannot find a user with this id!");
      }

      return foundUser;
    },
  },
  Mutation: {
    // login(email: String!, password: String!): Auth
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("no user found with that email address");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("email or password is incorrect");
      }
      const token = signToken(user);
      return { token, user };
    },

    // addUser(username: Sting!, email: String!, password: String!): Auth
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },





    // saveBook(input: BookInput): User
    saveBook: async (parent, body, context) => {
      //  console.log("Save book Server" , body)
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          {
            $push: {
              savedBooks: body.input,
            },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },




    // TODO: removeBook(bookId: ID): User
    removeBook: async (parent, body, context) => {
      console.log(body);
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          {
            $pull: {
              savedBooks: body.input,
            },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
