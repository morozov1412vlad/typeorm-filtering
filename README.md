# TypeORM Filtering

## Motivation

There is often a need for different SaaS platforms to have certain reporting tool. Such tools often include advanced filtering functionality that is often implemented from scratch. The main idea of this prototype app is to define certain interface for contracts between API consumer and API service related to filtering.

# Contract Overview

There are three main interfaces that are used for filtering:

- Compound Filter: used to filter entity records, expects `filters` property to be specified that has Conditional Block filter as value.
- Primitive Filter: used to define conditions for primitives (acceptance criteria for values in a given column of entity table).
- Conditional Block Filter: consists of two fields: `operator` and `conditions`. Defines whether intesection or union of child filters is needed, as well as whether it should be negated or not. `conditions` is an array of other Conditional Block Filters, Primitive Filters and Compound Filters.

Compound Filter and Attribute Filter require property to be specified `attribute` that inidicates full paths from target entity to entity/value specified in a given Compound/Primitive Filter respectively.

Full definitions of contract interfaces can be found in `apps/filtering-api/src/filtering/filter.types.ts`.

Small example from demo app:

Description: `Filter for users that have post with title containing "2" and post with title containing "3"`
```
    {
      attribute: 'users',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'users.posts',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'users.posts.title',
                  operator: PrimitiveFilterOperator.CONTAINS,
                  value: '2',
                },
              ],
            },
          },
          {
            attribute: 'users.posts',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'users.posts.title',
                  operator: PrimitiveFilterOperator.CONTAINS,
                  value: '3',
                },
              ],
            },
          },
        ],
      },
    },
```

# NestJS integration

Filtering app also includes module, service and @InjectFilter decorator for easier integration with NestJS.

# Demo Overview

Demo app is a simple REST API app that uses Postgres. There're three tables: users, posts and comments + one junction table for defining user followers.

There are three POST EPs to filter posts, users and comments. Each EP expects filter for respective entity.

## Starting Demo App

In order to start demo app you first of all need to install dependencies and create .env file in `apps/filtering-api` with DB configuration:

```
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
```

Then switch to `cd apps/filtering-api` directory and:

1. Run migrations by executing `pnpm run typeorm migration:run`.
2. (Optional) prefill DB with some test data by running `pnpm run seed`.

Switch back to root directory (`cd ../..`) and run `pnpm run dev`.

This command will start server and client apps. Client app has some predefined examples and additional field to perform your own filtering tests.

# Future work

1. Currently EntityFilter metadata exists to further define Filter Service for the model. Two different declarations of the same entity filter class will result into the same rules for filtering. However, entity filter class definitions should be more useful and allow to define rules for things like pre-filtering, aliases, fields to exclude from filtering, allowed operators and so on.
2. As DB schema definition exist on the BE side, any UI for filtering should be BE-driven. It would be great to define certain contract that will take Entity filter class definition and send it to the client as a configuration for filtering form.
3. Implement definitions for filtering for virtual entities. Currently DB views and meterealized views can be used to define additional entities. But ideally, it should be possible to define virtual entities during runtime for further processing.
4. Aggregation. Aggregation was not planned to be part of this project. However, aggregation is also common need for reporting tools, as well as filtering of aggregated data. That's why it would be great to define contract intefaces and rules for data aggregation, but it's a lot more complex task and point 3 should be done before aggregation.
