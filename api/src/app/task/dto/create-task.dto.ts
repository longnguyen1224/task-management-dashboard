import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsBoolean, IsInt } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Finish report',
  })
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
    example: 'Complete the quarterly report',
  })
  @IsOptional()
  @IsString()
  description?: string;

 
  //CATEGORY
  @ApiProperty({
    required: false,
    enum: ['Work', 'Personal'],
    example: 'Work',
  })
  @IsOptional()
  @IsIn(['Work', 'Personal'])
  category?: 'Work' | 'Personal';

  //COMPLETION STATUS

  @ApiProperty({
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;


  //ORDER (DRAG & DROP)

  @ApiProperty({
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
