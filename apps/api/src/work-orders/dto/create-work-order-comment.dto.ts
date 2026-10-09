import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkOrderCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;
}