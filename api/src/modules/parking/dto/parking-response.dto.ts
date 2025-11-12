import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParkingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  vehicleType: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  pricePerHour?: number;

  @ApiProperty()
  pricePerDay: number;

  @ApiProperty()
  pricePerMonth: number;

  @ApiPropertyOptional()
  distance?: number;

  @ApiPropertyOptional({ type: [String] })
  amenities?: string[];

  @ApiPropertyOptional({ type: [String] })
  images?: string[];

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  ownerName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

