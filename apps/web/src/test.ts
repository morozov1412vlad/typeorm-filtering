import { IsString } from 'class-validator';

export class A {
  @IsString()
  name: string;
}
