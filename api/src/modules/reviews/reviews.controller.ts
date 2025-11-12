import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review (requires completed booking)' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: ReviewResponseDto })
  async create(
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Get('parking/:parkingId')
  @ApiOperation({ summary: 'Get all reviews for a parking space' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully', type: [ReviewResponseDto] })
  async findByParking(@Param('parkingId') parkingId: string): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findByParking(parkingId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review (soft delete)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: any): Promise<{ message: string }> {
    await this.reviewsService.remove(id, user.id);
    return { message: 'Review deleted successfully' };
  }
}

