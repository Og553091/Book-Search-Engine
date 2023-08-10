const { AuthenticationError } = require('apollo-server-express');
const { User, Thought } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent,args,context) => {
        const foundUser = await User.findOne({
           _id:context.user._id
          });
      
          if (!foundUser) {
            return res.status(400).json({ message: 'Cannot find a user with this id!' });
          }
      
          res.json(foundUser)();
    },
   
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, args,context) => {
      

      const userData = await User.findOneAndUpdate(
        {  _id:context.user._id },
        { $addToSet: { savedBooks: args } }
      );

      return userData;
    },
    
    removeBook: async (parent, { bookId}, context) => {
      const userData = User.findOneAndDelete({  _id:context.user._id },
        { $pull: { savedBooks: {bookId:bookId} } });
        return userData
    },
   
  },
};

module.exports = resolvers;
