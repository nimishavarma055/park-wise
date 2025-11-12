import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    const { parkingId, bookingId, rating, reviewText } = createReviewDto;

    // Verify booking exists and belongs to user
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        parkingId,
        deletedAt: null,
        bookingStatus: 'completed',
      },
    });

    if (!booking) {
      throw new NotFoundException('Completed booking not found');
    }

    // Check if review already exists for this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview && !existingReview.deletedAt) {
      throw new BadRequestException('Review already exists for this booking');
    }

    // Verify parking exists
    const parking = await this.prisma.parkingSpace.findFirst({
      where: {
        id: parkingId,
        deletedAt: null,
      },
    });

    if (!parking) {
      throw new NotFoundException('Parking space not found');
    }

    // Create or update review
    const review = await this.prisma.review.upsert({
      where: { bookingId },
      create: {
        parkingId,
        userId,
        bookingId,
        rating,
        reviewText,
      },
      update: {
        rating,
        reviewText,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToResponseDto(review);
  }

  async findByParking(parkingId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        parkingId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.mapToResponseDto(r));
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.prisma.review.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Soft delete
    await this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private mapToResponseDto(review: any): ReviewResponseDto {
    return {
      id: review.id,
      parkingId: review.parkingId,
      userId: review.userId,
      bookingId: review.bookingId,
      rating: review.rating,
      reviewText: review.reviewText,
      user: review.user,
      createdAt: review.createdAt,
    };
  }
}

