import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    const { parkingId, bookingType, startTime, endTime, hours } = createBookingDto;

    // Verify parking exists and is approved
    // Use select to exclude location (geography) field
    const parking = await this.prisma.parkingSpace.findFirst({
      where: {
        id: parkingId,
        deletedAt: null,
        status: 'approved',
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        type: true,
        vehicleType: true,
        description: true,
        status: true,
        pricePerHour: true,
        pricePerDay: true,
        pricePerMonth: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!parking) {
      throw new NotFoundException('Parking space not found or not available');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        parkingId,
        deletedAt: null,
        bookingStatus: 'active',
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gte: start } },
            ],
          },
          {
            AND: [
              { startTime: { lte: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Parking space is already booked for this time period');
    }

    // Calculate total amount
    const durationMs = end.getTime() - start.getTime();
    let totalAmount = 0;

    if (bookingType === 'hourly') {
      const durationHours = durationMs / (1000 * 60 * 60);
      const pricePerHour = parking.pricePerHour 
        ? parseFloat(parking.pricePerHour.toString()) 
        : parseFloat(parking.pricePerDay.toString()) / 8;
      totalAmount = pricePerHour * durationHours;
    } else if (bookingType === 'daily') {
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
      totalAmount = parseFloat(parking.pricePerDay.toString()) * durationDays;
    } else if (bookingType === 'monthly') {
      const durationMonths = Math.ceil(durationMs / (1000 * 60 * 60 * 24 * 30));
      totalAmount = parseFloat(parking.pricePerMonth.toString()) * durationMonths;
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        parkingId,
        bookingType,
        startTime: start,
        endTime: end,
        totalAmount: totalAmount.toString(),
        bookingStatus: 'active',
        paymentStatus: 'pending',
      },
      include: {
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return this.mapToResponseDto(booking);
  }

  async findAll(userId: string, pagination: PaginationDto): Promise<PaginatedResponse<BookingResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.booking.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    const data = bookings.map((b) => this.mapToResponseDto(b));
    return new PaginatedResponse(data, total, page, limit);
  }

  async findOwnerBookings(ownerId: string, pagination: PaginationDto): Promise<PaginatedResponse<BookingResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const bookings = await this.prisma.booking.findMany({
      where: {
        parking: {
          ownerId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      include: {
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.booking.count({
      where: {
        parking: {
          ownerId,
          deletedAt: null,
        },
        deletedAt: null,
      },
    });

    const data = bookings.map((b) => this.mapToResponseDto(b));
    return new PaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user owns the booking or the parking
    if (booking.userId !== userId && booking.parking.ownerId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return this.mapToResponseDto(booking);
  }

  async cancel(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.bookingStatus === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.bookingStatus === 'completed') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: 'cancelled',
        deletedAt: new Date(),
      },
      include: {
        parking: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      userId: booking.userId,
      parkingId: booking.parkingId,
      bookingType: booking.bookingType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalAmount: parseFloat(booking.totalAmount),
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      parking: booking.parking,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

