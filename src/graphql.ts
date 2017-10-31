import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean,
} from 'graphql'
import {
    AddFoodCommand,
    RenameFoodCommand,
    DeleteFoodCommand,
    ISelectDinnerCommand,
} from './model'
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

const DayMenuType = new GraphQLObjectType({
    name: 'DayMenu',
    fields: {
        date: strType,
        dinner: { type: FoodType },
    },
})

const SuccessResultType = new GraphQLObjectType({
    name: 'SuccessResult',
    fields: {
        success: {
            type: GraphQLBoolean,
        },
    },
})

export const createSchema = (api: Api) =>
    new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'Query',
            fields: {
                food: {
                    type: new GraphQLList(FoodType),
                    resolve: (_, _args, req) => api.food(req.user),
                },
                dayMenu: {
                    type: new GraphQLList(DayMenuType),
                    args: {
                        from: strType,
                        to: strType,
                    },
                    resolve: (_, { from, to }, req) =>
                        api.findDayMenyForPeriod(from, to, req.user),
                },
            },
        }),
        mutation: new GraphQLObjectType({
            name: 'Mutation',
            fields: {
                addFood: {
                    type: SuccessResultType,
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
                    type: SuccessResultType,
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
                    type: SuccessResultType,
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
                selectDinner: {
                    type: SuccessResultType,
                    args: {
                        date: strType,
                        foodId: strType,
                    },
                    resolve: async (_, { date, foodId }, req) => {
                        const command: ISelectDinnerCommand = {
                            type: 'selectDinner',
                            foodId,
                            date: new Date(date),
                        }
                        await api.applyFoodForDayCommand(command, req.user)
                        return {
                            success: true,
                        }
                    },
                },
            },
        }),
    })
