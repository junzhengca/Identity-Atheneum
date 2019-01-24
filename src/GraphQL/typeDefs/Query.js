import { gql } from 'apollo-server-express';

export const Query = gql`
    type Query {
        base: Boolean
    }
`;
