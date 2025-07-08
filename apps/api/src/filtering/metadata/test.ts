import { User } from 'src/users/users.entity';
import { EntityFilter } from './EntityFilter.decorator';

@EntityFilter(User)
export class UserFilter {}
