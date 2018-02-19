const express = require('express'),
	app = express(),
	PORT = process.env.PORT || 8081,
	bodyParser = require('body-parser'),
	{ graphqlExpress } = require('apollo-server-express'),
	{ mergeSchemas } = require('graphql-tools'),
	{ expressPlayground } = require('graphql-playground-middleware'),
	{ getIntrospectSchema } = require('./introspection'),
	{ GraphQLObjectType } = require('graphql/type/definition');

//our graphql endpoints
const endpoints = [
	'http://localhost:8083',
	'http://localhost:8082'
];
//async function due to the async nature of grabbing all of our introspect schemas
(async function () {
	try {
		//promise.all to grab all remote schemas at the same time, we do not care what order they come back but rather just when they finish
		allSchemas = await Promise.all(endpoints.map(ep => getIntrospectSchema(ep)));
		//create function for /graphql endpoint and merge all the schemas
		app.post('/', bodyParser.json(), graphqlExpress({
			schema: mergeSchemas({
				schemas: allSchemas,
				onTypeConflict: (leftType, rightType) => {
					if (leftType instanceof GraphQLObjectType) {
						return mergeObjectTypes(leftType, rightType);
					}
					return leftType;
				}
			})
		}));
		app.get('/', expressPlayground({ endpointUrl: '/' }));
		//start up a graphql endpoint for our main server
		app.listen(PORT, () => console.log('GraphQL API listening on port:' + PORT));
	} catch (error) {
		console.log('ERROR: Failed to grab introspection queries', error);
	}
})();

function mergeObjectTypes(leftType, rightType) {
	if (!rightType) {
		return leftType;
	}
	if (leftType.constructor.name !== rightType.constructor.name) {
		throw new TypeError(`Cannot merge with different base type. this: ${leftType.constructor.name}, other: ${rightType.constructor.name}.`);
	}
	leftType.getFields() // Populate _fields
	leftType.getInterfaces() // Populate _interfaces
	for (const [key, value] of Object.entries(rightType.getFields())) {
		leftType._fields[key] = value;
	}
	for (const [key, value] of Object.entries(rightType.getInterfaces())) {
		leftType._interfaces[key] = value;
	}
	return leftType;
}
