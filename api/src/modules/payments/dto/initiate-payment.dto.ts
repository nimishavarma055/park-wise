import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'booking-id-uuid' })
  @IsString()
  bookingId: string;

  @ApiProperty({ enum: ['upi', 'razorpay'] })
  @IsEnum(['upi', 'razorpay'])
  paymentMethod: 'upi' | 'razorpay';
}

