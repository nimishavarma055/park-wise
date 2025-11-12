import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  parkingId: string;

  @ApiProperty()
  bookingType: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  bookingStatus: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  parking: {
    id: string;
    name: string;
    address: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

