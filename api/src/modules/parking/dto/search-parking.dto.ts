import { IsNumber, IsOptional, IsEnum, IsArray, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SearchParkingDto extends PaginationDto {
  @ApiPropertyOptional({ example: 28.6139, description: 'Latitude for nearby search' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 77.2090, description: 'Longitude for nearby search' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ example: 10, description: 'Radius in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  @Type(() => Number)
  radius?: number;

  @ApiPropertyOptional({ enum: ['covered', 'open'] })
  @IsOptional()
  @IsEnum(['covered', 'open'])
  type?: 'covered' | 'open';

  @ApiPropertyOptional({ enum: ['2W', '4W', 'both'] })
  @IsOptional()
  @IsEnum(['2W', '4W', 'both'])
  vehicleType?: '2W' | '4W' | 'both';

  @ApiPropertyOptional({ example: 0, description: 'Minimum price per day' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Maximum price per day' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ example: ['CCTV', 'EV Charging'], description: 'Filter by amenities' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ enum: ['distance', 'price-low', 'price-high'], default: 'distance' })
  @IsOptional()
  @IsEnum(['distance', 'price-low', 'price-high'])
  sortBy?: 'distance' | 'price-low' | 'price-high';
}

