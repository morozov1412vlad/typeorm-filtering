'use client';

import { plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';
import { A } from './test';
import { My } from './react-class/test2';

export const TestComponent = () => {
//   console.log(plain);
//   console.log(myResponse);

  return (
    <div>
      <My name="John"/>
    </div>
  );
};
