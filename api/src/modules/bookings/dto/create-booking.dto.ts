import { IsString, IsEnum, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'parking-id-uuid' })
  @IsString()
  parkingId: string;

  @ApiProperty({ enum: ['hourly', 'daily', 'monthly'] })
  @IsEnum(['hourly', 'daily', 'monthly'])
  bookingType: 'hourly' | 'daily' | 'monthly';

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-01-15T18:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 2, description: 'Number of hours (for hourly bookings)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  hours?: number;
}

