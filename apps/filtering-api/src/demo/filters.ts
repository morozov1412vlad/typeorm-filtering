import { EntityFilter } from '../filtering/nest/EntityFilter.decorator';
import { User, Comment, Post } from './entities';

@EntityFilter(User)
export class UserFilter {}

@EntityFilter(Comment)
export class CommentFilter {}

@EntityFilter(Post)
export class PostFilter {}
