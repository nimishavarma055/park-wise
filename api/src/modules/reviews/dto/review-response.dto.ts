import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  parkingId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  reviewText?: string;

  @ApiProperty()
  user: {
    id: string;
    name: string;
  };

  @ApiProperty()
  createdAt: Date;
}

