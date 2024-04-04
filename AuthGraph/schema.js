const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Query {
        hello: String,
        test: String,
        me (id: Int = 1): User
        older (age: Int): [User]
        createat(date: String): [User]
        findemailextensionandage (email: String, age: Int): [User]
        all: [User]
        allWithPagination(page: Int!, pageSize: Int!, sortBy: String!): [User]
        }

    type Mutation {
        createUser(user: UserInput!={name:"Jotaro",email:"jotaro@morio.jp",age:36,date:"2024-01-02"}): User!
        createManyUser(users: [UserInput!]=[{name:"Jotaro",email:"jotaro@morio.jp",age:36,date:"2024-01-02"}]): [User]
        updateUser(userUpdate: UserUpdate!): User
        deleteUser(id: Int): User
    }

    type User {
        id: ID,
        name: String,
        email: String,
        age: Int,
        date: String
    }

    input UserInput {
        name: String!,
        email: String!,
        age: Int!,
        date: String
    }

    input UserUpdate {
        id: Int!,
        name: String,
        email: String,
        age: Int
    }
    
`;

module.exports = { typeDefs };
