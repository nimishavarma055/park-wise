import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':parkingId')
  @ApiOperation({ summary: 'Add parking space to favorites' })
  @ApiResponse({ status: 201, description: 'Parking added to favorites', type: FavoriteResponseDto })
  async add(
    @CurrentUser() user: any,
    @Param('parkingId') parkingId: string,
  ): Promise<FavoriteResponseDto> {
    return this.favoritesService.add(user.id, parkingId);
  }

  @Delete(':parkingId')
  @ApiOperation({ summary: 'Remove parking space from favorites' })
  @ApiResponse({ status: 200, description: 'Parking removed from favorites' })
  async remove(
    @CurrentUser() user: any,
    @Param('parkingId') parkingId: string,
  ): Promise<{ message: string }> {
    await this.favoritesService.remove(user.id, parkingId);
    return { message: 'Parking removed from favorites' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorites for current user' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully', type: [FavoriteResponseDto] })
  async findAll(@CurrentUser() user: any): Promise<FavoriteResponseDto[]> {
    return this.favoritesService.findAll(user.id);
  }
}

