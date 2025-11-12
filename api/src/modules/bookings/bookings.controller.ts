import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (User only)' })
  @ApiResponse({ status: 201, description: 'Booking created successfully', type: BookingResponseDto })
  async create(
    @CurrentUser() user: any,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.create(user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for current user' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    return this.bookingsService.findAll(user.id, pagination);
  }

  @Get('owner')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Get all bookings for parking spaces owned by current user (Owner only)' })
  @ApiResponse({ status: 200, description: 'Owner bookings retrieved successfully' })
  async findOwnerBookings(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    return this.bookingsService.findOwnerBookings(user.id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully', type: BookingResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(id, user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (soft delete)' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully', type: BookingResponseDto })
  async cancel(@Param('id') id: string, @CurrentUser() user: any): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(id, user.id);
  }
}

