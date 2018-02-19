const { makeExecutableSchema } = require('graphql-tools');
const data = require('./data');

// SCHEMA DEFINITION
const typeDefs = `
type Query {
  article(id: ID!): Article
}
type Article {
  id: ID!
  name: String
}`

// RESOLVERS
const resolvers = {
	Query: {
		article: (root, args, context, info) => {
			return data.find(item => item.id == args.id);
		}
	},
}

// (EXECUTABLE) SCHEMA
module.exports = makeExecutableSchema({
	typeDefs,
	resolvers
});