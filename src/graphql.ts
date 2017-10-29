import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInputObjectType,
    GraphQLUnionType,
} from 'graphql'
import { AddFoodCommand, RenameFoodCommand, DeleteFoodCommand } from './model'
import { Api } from './api'

const optionalStrType = {
    type: GraphQLString,
}

const strType = {
    type: new GraphQLNonNull(GraphQLString),
}

const FoodType = new GraphQLObjectType({
    name: 'Food',
    fields: {
        name: optionalStrType,
        id: optionalStrType,
    },
})

const FoodResultType = new GraphQLObjectType({
    name: 'FoodCommandResult',
    fields: {
        success: {
            type: GraphQLBoolean,
        },
    },
})

const delay = (t: number) =>
    new Promise(resolve => {
        setTimeout(resolve, t)
    })

export const createSchema = (api: Api) =>
    new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
                food: {
                    type: new GraphQLList(FoodType),
                    resolve: (_, args, req) => api.food(req.user),
                },
            },
        }),
        mutation: new GraphQLObjectType({
            name: 'Mutation',
            fields: {
                addFood: {
                    type: FoodResultType,
                    args: {
                        aggregateId: strType,
                        name: strType,
                    },
                    resolve: async (_, { aggregateId, name }, req) => {
                        const command: AddFoodCommand = {
                            type: 'addFood',
                            aggregateId,
                            name,
                        }
                        await api.applyFoodCommands([command], req.user)
                        return {
                            success: true,
                        }
                    },
                },
                renameFood: {
                    type: FoodResultType,
                    args: {
                        aggregateId: strType,
                        name: strType,
                    },
                    resolve: async (_, { aggregateId, name }, req) => {
                        const command: RenameFoodCommand = {
                            type: 'renameFood',
                            aggregateId,
                            name,
                        }
                        await api.applyFoodCommands([command], req.user)
                        return {
                            success: true,
                        }
                    },
                },
                deleteFood: {
                    type: FoodResultType,
                    args: {
                        aggregateId: strType,
                    },
                    resolve: async (_, { aggregateId }, req) => {
                        const command: DeleteFoodCommand = {
                            type: 'deleteFood',
                            aggregateId,
                        }
                        await api.applyFoodCommands([command], req.user)
                        return {
                            success: true,
                        }
                    },
                },
            },
        }),
    })
