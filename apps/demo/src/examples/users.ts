import { PrimitiveFilterOperator, ConditionalOperator } from '../types';
import { type Example } from './types';

export const usersExamples: Example[] = [
  {
    payload: {
      attribute: 'users',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'users.username',
            operator: PrimitiveFilterOperator.IS,
            value: 'user1',
          },
        ],
      },
    },
    description: 'Filter for users with username "user1"',
  },
  {
    payload: {
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
    description:
      'Filter for users that have post with title containing "2" and post with title containing "3',
  },
  {
    payload: {
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
                  attribute: 'users.posts.id',
                  operator: PrimitiveFilterOperator.IS_NULL,
                  value: true,
                },
              ],
            },
          },
        ],
      },
    },
    description: 'Filter for users that have no post',
  },
  {
    payload: {
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
                  attribute: 'users.posts.id',
                  operator: PrimitiveFilterOperator.IS_NULL,
                  value: false,
                },
              ],
            },
          },
        ],
      },
    },
    description: 'Filter for users that have at least one post',
  },
  {
    payload: {
      attribute: 'users',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'users.followers',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'users.followers.id',
                  operator: PrimitiveFilterOperator.IN,
                  value: [1, 2],
                },
              ],
            },
          },
        ],
      },
    },
    description:
      'Filter for users that are followed by user with id 1 or user with id 2',
  },
  {
    payload: {
      attribute: 'users',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'users.followers',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'users.followers.id',
                  operator: PrimitiveFilterOperator.IN,
                  value: [7],
                },
              ],
            },
          },
          {
            is_negated: true,
            conditional_operator: ConditionalOperator.AND,
            conditions: [
              {
                attribute: 'users.followers',
                filters: {
                  conditional_operator: ConditionalOperator.AND,
                  conditions: [
                    {
                      attribute: 'users.followers.id',
                      operator: PrimitiveFilterOperator.IN,
                      value: [7],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    description:
      'Filter for users that are only followed by user with id 7',
  },
];
