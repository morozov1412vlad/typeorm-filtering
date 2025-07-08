'use client';

import { plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';
import { A } from './test';

export const TestComponent = () => {
  console.log(plainToInstance(A, { name: 'a' }));
  console.log(validateSync(plainToInstance(A, { name: 12 })));

  return <div></div>;
};
