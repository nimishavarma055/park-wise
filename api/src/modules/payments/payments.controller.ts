import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment (Mock Razorpay)' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully', type: PaymentResponseDto })
  async initiate(
    @CurrentUser() user: any,
    @Body() initiatePaymentDto: InitiatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.initiate(user.id, initiatePaymentDto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a payment (Mock Razorpay)' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully', type: PaymentResponseDto })
  async confirm(
    @CurrentUser() user: any,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.confirm(user.id, confirmPaymentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: PaymentResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id, user.id);
  }
}

