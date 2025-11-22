import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleTypeString } from '../../../common/types/vehicle-type.enum';

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

  @ApiProperty({ enum: ['2W', '4W', 'both'] })
  vehicleType: VehicleTypeString;

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

  @ApiPropertyOptional()
  ownerVerified?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

