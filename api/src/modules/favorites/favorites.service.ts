import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, parkingId: string): Promise<FavoriteResponseDto> {
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

    // Check if already favorited
    const existing = await this.prisma.favorite.findFirst({
      where: {
        userId,
        parkingId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('Parking space is already in favorites');
    }

    // Create or restore favorite
    const favorite = await this.prisma.favorite.upsert({
      where: {
        userId_parkingId: {
          userId,
          parkingId,
        },
      },
      create: {
        userId,
        parkingId,
      },
      update: {
        deletedAt: null,
      },
      include: {
        parking: {
          include: {
            owner: true,
            amenities: true,
            images: true,
          },
        },
      },
    });

    return this.mapToResponseDto(favorite);
  }

  async remove(userId: string, parkingId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        parkingId,
        deletedAt: null,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    // Soft delete
    await this.prisma.favorite.update({
      where: { id: favorite.id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(userId: string): Promise<FavoriteResponseDto[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        parking: {
          include: {
            owner: true,
            amenities: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => this.mapToResponseDto(f));
  }

  private mapToResponseDto(favorite: any): FavoriteResponseDto {
    return {
      id: favorite.id,
      userId: favorite.userId,
      parkingId: favorite.parkingId,
      parking: {
        id: favorite.parking.id,
        name: favorite.parking.name,
        address: favorite.parking.address,
        latitude: parseFloat(favorite.parking.latitude),
        longitude: parseFloat(favorite.parking.longitude),
        type: favorite.parking.type,
        vehicleType: favorite.parking.vehicleType,
        description: favorite.parking.description,
        status: favorite.parking.status,
        pricePerHour: favorite.parking.pricePerHour ? parseFloat(favorite.parking.pricePerHour) : undefined,
        pricePerDay: parseFloat(favorite.parking.pricePerDay),
        pricePerMonth: parseFloat(favorite.parking.pricePerMonth),
        amenities: favorite.parking.amenities?.map((a: any) => a.amenityName) || [],
        images: favorite.parking.images?.map((img: any) => img.imageUrl) || [],
        ownerId: favorite.parking.ownerId,
        ownerName: favorite.parking.owner?.name || '',
        createdAt: favorite.parking.createdAt,
        updatedAt: favorite.parking.updatedAt,
      },
      createdAt: favorite.createdAt,
    };
  }
}

