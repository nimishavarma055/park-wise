import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Min, Max, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParkingDto {
  @ApiProperty({ example: 'Downtown Parking Space' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main St, City, State' })
  @IsString()
  address: string;

  @ApiProperty({ example: 28.6139, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: 77.2090, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ enum: ['covered', 'open'] })
  @IsEnum(['covered', 'open'])
  type: 'covered' | 'open';

  @ApiProperty({ enum: ['2W', '4W', 'both'] })
  @IsEnum(['2W', '4W', 'both'])
  vehicleType: '2W' | '4W' | 'both';

  @ApiPropertyOptional({ example: 'Spacious parking space in downtown area' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerHour?: number;

  @ApiProperty({ example: 200.00 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerDay: number;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerMonth: number;

  @ApiPropertyOptional({ example: ['CCTV', 'EV Charging', 'Security Guard'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: { startHour: 0, endHour: 23, availableHours: [9, 10, 11, 12, 13, 14, 15, 16, 17] } })
  @IsOptional()
  timeSlots?: {
    startHour: number;
    endHour: number;
    availableHours: number[];
  };
}

