import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { SearchParkingDto } from './dto/search-parking.dto';
import { ParkingResponseDto } from './dto/parking-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@ApiTags('Parking')
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create a new parking space (Owner only)' })
  @ApiResponse({ status: 201, description: 'Parking space created successfully', type: ParkingResponseDto })
  async create(
    @CurrentUser() user: any,
    @Body() createParkingDto: CreateParkingDto,
  ): Promise<ParkingResponseDto> {
    return this.parkingService.create(user.id, createParkingDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all parking spaces with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Parking spaces retrieved successfully' })
  async findAll(@Query() query: SearchParkingDto): Promise<PaginatedResponse<ParkingResponseDto>> {
    return this.parkingService.findAll(query);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search nearby parking spaces using PostGIS' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query() query: SearchParkingDto): Promise<PaginatedResponse<ParkingResponseDto>> {
    return this.parkingService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get parking space by ID' })
  @ApiResponse({ status: 200, description: 'Parking space retrieved successfully', type: ParkingResponseDto })
  @ApiQuery({ name: 'lat', required: false, description: 'User latitude for distance calculation' })
  @ApiQuery({ name: 'lon', required: false, description: 'User longitude for distance calculation' })
  async findOne(
    @Param('id') id: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @CurrentUser() user?: any,
  ): Promise<ParkingResponseDto> {
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLon = lon ? parseFloat(lon) : undefined;
    return this.parkingService.findOne(id, user?.id, userLat, userLon);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update parking space (Owner only)' })
  @ApiResponse({ status: 200, description: 'Parking space updated successfully', type: ParkingResponseDto })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateParkingDto: UpdateParkingDto,
  ): Promise<ParkingResponseDto> {
    return this.parkingService.update(id, user.id, updateParkingDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete parking space (soft delete, Owner only)' })
  @ApiResponse({ status: 200, description: 'Parking space deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: any): Promise<{ message: string }> {
    await this.parkingService.remove(id, user.id);
    return { message: 'Parking space deleted successfully' };
  }
}

