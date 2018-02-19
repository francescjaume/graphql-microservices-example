const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	{ graphqlExpress } = require('apollo-server-express'),
	{ makeRemoteExecutableSchema, introspectSchema } = require('graphql-tools'),
	{ expressPlayground } = require('graphql-playground-middleware'),
	schema = require('./schema');

app.post('/', bodyParser.json(), graphqlExpress({ schema }));
app.get('/', expressPlayground({ endpointUrl: '/' }));
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => console.log('GraphQL API listening on port:' + PORT));
