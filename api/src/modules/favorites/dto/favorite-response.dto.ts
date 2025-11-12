import { ApiProperty } from '@nestjs/swagger';
import { ParkingResponseDto } from '../../parking/dto/parking-response.dto';

export class FavoriteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  parkingId: string;

  @ApiProperty({ type: ParkingResponseDto })
  parking: ParkingResponseDto;

  @ApiProperty()
  createdAt: Date;
}

