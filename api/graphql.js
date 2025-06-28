import { graphqlHTTP } from 'express-graphql';
import {
  GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull
} from 'graphql';
import Offer from '../models/Offer.js';

const OfferType = new GraphQLObjectType({
  name: 'Offer',
  fields: {
    id: { type: GraphQLNonNull(GraphQLString) },
    tokenId: { type: GraphQLString },
    tokenAddress: { type: GraphQLString },
    status: { type: GraphQLString },
    orderHash: { type: GraphQLString },
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    offer: {
      type: OfferType,
      args: { id: { type: GraphQLNonNull(GraphQLString) } },
      resolve: (_, { id }) => Offer.findById(id),
    }
  }
});

export default graphqlHTTP({
  schema: new GraphQLSchema({ query: RootQuery }),
  graphiql: true,
});
