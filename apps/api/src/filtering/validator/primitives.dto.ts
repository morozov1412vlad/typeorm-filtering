import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsDateString
} from 'class-validator';
import { BooleanOperator, ConditionalOperator, DateOperator, NullableOperator, NumberOperator, StringOperator } from '../types';

class ConditionalNodeDTO {
  @IsEnum(ConditionalOperator)
  conditional_operator: ConditionalOperator;

  @IsArray()
  //   @ValidateNested({ each: true })
  //   @Type(() => )
  conditions: [];
}

export function PrimitiveFilterBaseDTO<E extends object>(
  operatorEnum: E,
) {
  abstract class PrimitiveFilterBase {
    @IsEnum(operatorEnum)
    operator: E;

    @IsOptional()
    @IsBoolean()
    is_negated: boolean;
  }
  return PrimitiveFilterBase;
}

export class NullableFilterDTO extends PrimitiveFilterBaseDTO(NullableOperator) {
  @IsBoolean()
  value: boolean;
}

export class StringFilterDTO extends PrimitiveFilterBaseDTO(StringOperator) {
  @IsString()
  value: string;
}

export class NumberFilterDTO extends PrimitiveFilterBaseDTO(NumberOperator) {
  @IsNumber()
  value: number;
}

export class BooleanFilterDTO extends PrimitiveFilterBaseDTO(BooleanOperator) {
  @IsBoolean()
  value: boolean;
}

export class DateFilterDTO extends PrimitiveFilterBaseDTO(DateOperator) {
  @IsDateString()
  value: Date;
}
