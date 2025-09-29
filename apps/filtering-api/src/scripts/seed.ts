import 'dotenv/config';
import 'reflect-metadata';
import dataSource from '../data-source';
import { User, Post, Comment } from '../demo/entities';

const usersData: Array<Partial<User>> = [
  {
    email: 'user1@example.com',
    username: 'user1',
    first_name: 'John',
    last_name: 'Snow',
  },
  {
    email: 'user2@example.com',
    username: 'user2',
    first_name: 'Donald',
    last_name: 'Duck',
  },
  {
    email: 'user3@example.com',
    username: 'user3',
    first_name: 'Jane',
    last_name: 'Foster',
  },
  {
    email: 'user4@example.com',
    username: 'user4',
    first_name: 'Sam',
    last_name: 'Johnson',
  },
  {
    email: 'user5@example.com',
    username: 'user5',
    first_name: 'Tony',
    last_name: 'Stark',
  },
  {
    email: 'user6@example.com',
    username: 'user6',
    first_name: 'Peter',
    last_name: 'Parker',
  },
  {
    email: 'user7@example.com',
    username: 'user7',
    first_name: 'Lightning',
    last_name: 'McQueen',
  },
  {
    email: 'user8@example.com',
    username: 'user8',
    first_name: 'Dora',
    last_name: 'Explorer',
  },
  {
    email: 'user9@example.com',
    username: 'user9',
    first_name: 'Minnie',
    last_name: 'Mouse',
  },
  {
    email: 'user10@example.com',
    username: 'user10',
    first_name: 'Mickey',
    last_name: 'Mouse',
  },
];

const postsPlan: Record<string, number> = {
  user1: 1,
  user2: 0,
  user3: 3,
  user4: 8,
  user5: 2,
  user6: 5,
  user7: 5,
  user8: 10,
  user9: 3,
  user10: 7,
};

// Keys are follower (who follows), values are the users they follow.
const follows: Record<string, string[]> = {
  user1: ['user2', 'user3', 'user4'],
  user2: ['user3', 'user5'],
  user3: ['user4', 'user5', 'user6'],
  user4: ['user1'],
  user5: ['user1', 'user2', 'user3', 'user4'],
  user6: ['user5', 'user7', 'user8'],
  user7: ['user8', 'user9'],
  user8: ['user7', 'user10'],
  user9: ['user10'],
  user10: [],
};

const commentsPlan: Record<string, { [key in number]: number }> = {
  user1: {
    1: 1,
    3: 2,
  },
  user2: {
    3: 1,
    5: 2,
  },
  user3: {
    4: 1,
    5: 1,
    10: 3,
  },
  user4: {
    1: 1,
    3: 2,
  },
  user5: {
    21: 1,
    2: 1,
    11: 1,
    20: 2,
  },
  user6: {
    1: 1,
    5: 1,
    7: 2,
    8: 3,
  },
  user7: {
    8: 1,
    9: 2,
  },
  user8: {
    1: 2,
    7: 1,
    10: 2,
    11: 3,
    31: 4,
    21: 3,
    18: 1,
    17: 2,
  },
  user9: {
    10: 1,
  },
  user10: {},
};

async function main() {
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const postRepo = manager.getRepository(Post);
    const commentRepo = manager.getRepository(Comment);

    // Create users
    const users = userRepo.create(usersData);
    await userRepo.save(users);

    // Map usernames -> ids for convenience
    const freshUsers = await userRepo.find({ select: ['id', 'username'] });
    const idByUsername = new Map(freshUsers.map((u) => [u.username, u.id]));
    const id = (uname: string) => idByUsername.get(uname)!;

    // Create posts
    const postsToInsert: Post[] = [];
    let postCounter = 1;

    for (const [uname, count] of Object.entries(postsPlan)) {
      const authorId = id(uname);
      for (let i = 0; i < count; i++) {
        postsToInsert.push(
          postRepo.create({
            title: `Post ${postCounter} by ${uname}`,
            content: `Static content for post #${postCounter} authored by ${uname}.`,
            user: { id: authorId } as any, // Post.user expects Pick<User,'username'|'id'>; id is enough
          }),
        );
        postCounter++;
      }
    }

    await postRepo.save(postsToInsert);
    const savedPosts = (await postRepo.find({ select: ['id', 'title'] })).sort(
      (a, b) => a.id - b.id,
    );

    // Create followers

    for (const [followerU, followingUList] of Object.entries(follows)) {
      const followerId = id(followerU);
      const followingIds = followingUList.map(id);
      if (followingIds.length) {
        await manager
          .createQueryBuilder()
          .relation(User, 'following')
          .of(followerId)
          .add(followingIds);
      }
    }

    // Create comments
    const commentsToInsert: Comment[] = [];
    for (const [uname, counts] of Object.entries(commentsPlan)) {
      const authorId = id(uname);
      for (const p of savedPosts) {
        if(counts[p.id]) {
          for (let i = 1; i <= counts[p.id]; i++) {
            commentsToInsert.push(
              commentRepo.create({
                content: `Comment on "${p.title}" by user${authorId}.`,
                post: { id: p.id } as any,
                user: { id: authorId } as any,
              }),
            );
          }
        }
      }
    }
    if (commentsToInsert.length) {
      await commentRepo.save(commentsToInsert);
    }

    console.log('Seed complete:');
  });

  await dataSource.destroy();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try {
    await dataSource.destroy();
  } catch {
    console.error('Failed to destroy dataSource');
  }
  process.exit(1);
});
