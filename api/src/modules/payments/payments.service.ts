import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiate(userId: string, initiatePaymentDto: InitiatePaymentDto): Promise<PaymentResponseDto> {
    const { bookingId, paymentMethod } = initiatePaymentDto;

    // Verify booking exists and belongs to user
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        deletedAt: null,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.paymentStatus === 'completed') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    // Generate mock Razorpay order ID
    const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount: booking.totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        razorpayOrderId,
      },
    });

    return this.mapToResponseDto(payment);
  }

  async confirm(userId: string, confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentResponseDto> {
    const { paymentId, razorpayPaymentId, razorpaySignature } = confirmPaymentDto;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('You can only confirm your own payments');
    }

    if (payment.paymentStatus === 'completed') {
      throw new BadRequestException('Payment already completed');
    }

    // Mock Razorpay payment confirmation
    // In production, verify the signature here
    const mockPaymentId = razorpayPaymentId || `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = razorpaySignature || `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'completed',
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    });

    // Update booking payment status
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: 'completed',
      },
    });

    return this.mapToResponseDto(updatedPayment);
  }

  async findOne(id: string, userId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('You can only view your own payments');
    }

    return this.mapToResponseDto(payment);
  }

  private mapToResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: parseFloat(payment.amount),
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}

