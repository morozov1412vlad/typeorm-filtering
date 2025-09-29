import { PrimitiveFilterOperator, ConditionalOperator } from '../types';
import { type Example } from './types';

export const commentsExamples: Example[] = [
  {
    payload: {
      attribute: 'comments',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'comments.post',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'comments.post.id',
                  operator: PrimitiveFilterOperator.IS,
                  value: 3,
                },
              ],
            },
          },
        ],
      },
    },
    description: 'Filter for comments on the posts with id 3',
  },
  {
    payload: {
      attribute: 'comments',
      filters: {
        conditional_operator: ConditionalOperator.AND,
        conditions: [
          {
            attribute: 'comments.post',
            filters: {
              conditional_operator: ConditionalOperator.AND,
              conditions: [
                {
                  attribute: 'comments.post.user',
                  filters: {
                    conditional_operator: ConditionalOperator.AND,
                    conditions: [
                      {
                        attribute: 'comments.post.user.following',
                        filters: {
                          conditional_operator: ConditionalOperator.AND,
                          conditions: [
                            {
                              attribute:
                                'comments.post.user.following.followers',
                              filters: {
                                conditional_operator: ConditionalOperator.AND,
                                conditions: [
                                  {
                                    attribute:
                                      'comments.post.user.following.followers.id',
                                    operator: PrimitiveFilterOperator.IS,
                                    value: 3,
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    description:
      'Filter for comments on the posts that were created by users who follows user(s) who followed by user with id 3',
  },
];
