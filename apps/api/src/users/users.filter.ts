import { EntityFilter } from '../filtering/metadata';
import { User } from './users.entity';

@EntityFilter(User)
export class UserFilter {}