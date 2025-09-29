import { PrimitiveFilterOperator, ConditionalOperator } from '../types';
import { type Example } from './types';

export const postsExamples: Example[] = [
  {
    payload: {
      attribute: 'posts',
      filters: {
        conditional_operator: ConditionalOperator.OR,
        conditions: [],
      },
    },
    description: 'Filter for all posts',
  },
  {
    payload: {
      attribute: 'posts',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'posts.title',
            operator: PrimitiveFilterOperator.CONTAINS,
            value: '3',
          },
        ],
      },
    },
    description: 'Filter for posts with title containing "3"',
  },
  {
    payload: {
      attribute: 'posts',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'posts.user',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'posts.user.username',
                  operator: PrimitiveFilterOperator.IS,
                  value: 'user1',
                },
              ],
            },
          },
        ],
      },
    },
    description: 'Filter for posts created by user with username "user1"',
  },
  {
    payload: {
      attribute: 'posts',
      filters: {
        conditional_operator: ConditionalOperator.OR,
        conditions: [
          {
            attribute: 'posts.user',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'posts.user.id',
                  operator: PrimitiveFilterOperator.IN,
                  value: [1, 2, 3],
                },
              ],
            },
          },
          {
            attribute: 'posts.title',
            operator: PrimitiveFilterOperator.CONTAINS,
            value: '1',
          },
        ],
      },
    },
    description:
      'Filter for posts created by users with id in [1, 2, 3] or title containing "1"',
  },
];
