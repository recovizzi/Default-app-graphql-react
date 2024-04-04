const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApolloError } = require('apollo-server-errors');

const handleError = (error, message, code) => {
    console.error(error);
    throw new ApolloError(message, code, {
        originalError: error.message,
    });
};

const resolvers = {
    Query: {
        hello: () => 'Hello, World!',

        test: () => {
            try {
                return 'Test';
            } catch (error) {
                throw new ApolloError('Error in test', 'R400', {
                    customField: 'Error occurred in test.',
                });
            }
        },

        me: async (_, { id }) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: parseInt(id) },
                });
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            } catch (error) {
                handleError(error, `Failed to fetch user with ID ${id}`, 'USER_NOT_FOUND');
            }
        },

        all: async () => {
            try {
                const users = await prisma.user.findMany();
                if (!users) {
                    throw new Error('No users found');
                }
                return users;
            } catch (error) {
                // Assurez-vous que le message d'erreur soit utile pour le débogage et informe correctement le client de ce qui s'est mal passé
                const errorMessage = 'Failed to fetch users. Please try again later.';
                
                // Utiliser un code d'erreur personnalisé peut aider le client à comprendre le type d'erreur sans avoir à analyser le message
                const errorCode = 'FETCH_USERS_FAILED';
                
                // Logger l'erreur pour le débogage côté serveur
                console.error(error);
                
                // Lever une ApolloError avec le message, le code, et tout détail supplémentaire pertinent
                throw new ApolloError(errorMessage, errorCode, {
                    // Vous pouvez ajouter ici des détails supplémentaires si nécessaire
                    internalError: error.message,
                });
            }
        },
        

        older: async (_, { age }) => {
            try {
                if (isNaN(age)) {
                    throw new Error('Invalid age input');
                }
        
                const results = await prisma.user.findMany({
                    where: {
                        age: {
                            gt: parseInt(age),
                        },
                    },
                });
        
                if (results.length === 0) {
                    // On peut choisir de ne pas considérer cela comme une erreur
                    // et simplement retourner un tableau vide
                    return [];
                }
        
                return results;
            } catch (error) {
                let errorMessage = 'Failed to fetch older users.';
                let errorCode = 'FETCH_OLDER_USERS_FAILED';
        
                if (error.message === 'Invalid age input') {
                    errorMessage = 'The provided age is invalid. Please provide a numeric age value.';
                    errorCode = 'INVALID_AGE_INPUT';
                }
        
                console.error(error);
        
                throw new ApolloError(errorMessage, errorCode, {
                    internalError: error.message,
                });
            }
        },
        

        findemailextensionandage: async (_, { email, age }) => {
            try {
                if (!email.includes('@')) {
                    throw new Error('Invalid email format');
                }
                if (isNaN(age)) {
                    throw new Error('Invalid age input');
                }
        
                const emailExtension = email.split('@')[1];
                const results = await prisma.user.findMany({
                    where: {
                        AND: [
                            { email: { contains: emailExtension } },
                            { age: { gt: parseInt(age) } }
                        ]
                    }
                });
        
                return results;
            } catch (error) {
                let errorMessage = 'Failed to fetch users by email extension and age.';
                let errorCode = 'FETCH_BY_EMAIL_AND_AGE_FAILED';
        
                if (error.message === 'Invalid email format') {
                    errorMessage = 'The provided email does not have a valid format. Please include an "@" in the email.';
                    errorCode = 'INVALID_EMAIL_FORMAT';
                } else if (error.message === 'Invalid age input') {
                    errorMessage = 'The provided age is invalid. Please provide a numeric age value.';
                    errorCode = 'INVALID_AGE_INPUT';
                }
        
                console.error(error);
        
                throw new ApolloError(errorMessage, errorCode, {
                    internalError: error.message,
                });
            }
        },
        

        createat: async (_, { date }) => {
            try {
                if (!Date.parse(date)) {
                    throw new Error('Invalid date format');
                }
        
                const results = await prisma.user.findMany({
                    where: { date: new Date(date) },
                });
        
                if (results.length === 0) {
                    throw new Error('No users found for the provided date');
                }
        
                return results;
            } catch (error) {
                let errorMessage = 'Failed to fetch users by creation date.';
                let errorCode = 'FETCH_BY_CREATION_DATE_FAILED';
        
                if (error.message === 'Invalid date format') {
                    errorMessage = 'The provided date does not have a valid format. Please use a valid date format, e.g., YYYY-MM-DD.';
                    errorCode = 'INVALID_DATE_FORMAT';
                } else if (error.message === 'No users found for the provided date') {
                    errorMessage = 'No users found for the specified creation date.';
                    errorCode = 'NO_USERS_FOUND';
                }
        
                console.error(error);
        
                throw new ApolloError(errorMessage, errorCode, {
                    internalError: error.message,
                });
            }
        },
        

        allWithPagination: async (_, { page, pageSize, sortBy }) => {
            try {
                const skip = (page - 1) * pageSize;
                const orderBy = {};
        
                // Vérification des paramètres de tri valides
                const validSortOptions = ['name_asc', 'name_desc', 'age_asc', 'age_desc', 'email_asc', 'email_desc', 'default'];
                if (!validSortOptions.includes(sortBy)) {
                    throw new Error(`Invalid sortBy value: ${sortBy}. Valid options are ${validSortOptions.join(', ')}.`);
                }
        
                if (sortBy === 'name_asc') {
                    orderBy.name = 'asc';
                } else if (sortBy === 'name_desc') {
                    orderBy.name = 'desc';
                } else if (sortBy === 'age_asc') {
                    orderBy.age = 'asc';
                } else if (sortBy === 'age_desc') {
                    orderBy.age = 'desc';
                } else if (sortBy === 'email_asc') {
                    orderBy.email = 'asc';
                } else if (sortBy === 'email_desc') {
                    orderBy.email = 'desc';
                } else if (sortBy === 'default') {
                    orderBy.id = 'asc';
                }
        
                const users = await prisma.user.findMany({
                    skip,
                    take: pageSize,
                    orderBy,
                });
        
                if (users.length === 0) {
                    throw new Error('No users found with the specified filters.');
                }
        
                return users;
            } catch (error) {
                let errorMessage = 'Failed to fetch users with pagination.';
                let errorCode = 'FETCH_WITH_PAGINATION_FAILED';
        
                if (error.message.startsWith('Invalid sortBy value')) {
                    errorMessage = error.message;
                    errorCode = 'INVALID_SORT_BY';
                } else if (error.message === 'No users found with the specified filters.') {
                    errorMessage = 'No users found based on the provided sorting and pagination parameters.';
                    errorCode = 'NO_USERS_FOUND';
                }
        
                console.error(error);
        
                throw new ApolloError(errorMessage, errorCode, {
                    internalError: error.message,
                });
            }
        },
        
    },




    Mutation: {

        createUser: async (_, { user }) => {
            return await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    age: user.age,
                    date: user.date
                },
            });
        },


        createManyUser: async (_, { users }) => {
            const createUserPromises = users.map(user => {
                return prisma.user.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        age: user.age,
                        date: user.date
                    },
                });
            });
            return await Promise.all(createUserPromises);
        },

        updateUser: async (_, { userUpdate }) => {
            const { id, ...updateData } = userUpdate;
            return await prisma.user.update({
                where: { id: parseInt(id) },
                data: updateData,
            });
        },


        deleteUser: async (_, { id }) => {
            return await prisma.user.delete({
                where: { id: parseInt(id) },
            });
        },
    },
};

module.exports = resolvers;
