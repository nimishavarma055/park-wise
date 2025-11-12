import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'payment-id-uuid' })
  @IsString()
  paymentId: string;

  @ApiPropertyOptional({ example: 'razorpay_order_123' })
  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @ApiPropertyOptional({ example: 'razorpay_payment_456' })
  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @ApiPropertyOptional({ example: 'razorpay_signature_789' })
  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}

