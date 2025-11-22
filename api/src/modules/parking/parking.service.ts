import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { SearchParkingDto } from './dto/search-parking.dto';
import { ParkingResponseDto } from './dto/parking-response.dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { VehicleTypeString } from '../../common/types/vehicle-type.enum';

@Injectable()
export class ParkingService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, createParkingDto: CreateParkingDto): Promise<ParkingResponseDto> {
    const { latitude, longitude, amenities, images, timeSlots, ...parkingData } = createParkingDto;

    // Create parking space using raw SQL for PostGIS location
    const result = await this.prisma.$queryRawUnsafe(`
      INSERT INTO parking_spaces (
        id, owner_id, name, address, location, latitude, longitude, type, vehicle_type, 
        description, status, price_per_hour, price_per_day, price_per_month, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        '${ownerId}', 
        '${parkingData.name.replace(/'/g, "''")}', 
        '${parkingData.address.replace(/'/g, "''")}', 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${latitude}, 
        ${longitude}, 
        '${parkingData.type}', 
        '${parkingData.vehicleType}', 
        ${parkingData.description ? `'${parkingData.description.replace(/'/g, "''")}'` : 'NULL'},
        'pending',
        ${parkingData.pricePerHour || 'NULL'},
        ${parkingData.pricePerDay},
        ${parkingData.pricePerMonth},
        NOW(),
        NOW()
      ) RETURNING id
    `);

    const parkingId = (result as Array<{ id: string }>)[0].id;

    // Get the created parking with relations (exclude location field)
    let parking;
    try {
      parking = await this.prisma.parkingSpace.findUnique({
        where: { id: parkingId },
        select: {
          id: true,
          ownerId: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          type: true,
          vehicleType: true,
          description: true,
          status: true,
          pricePerHour: true,
          pricePerDay: true,
          pricePerMonth: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          owner: true,
          amenities: true,
          images: true,
        },
      });
    } catch (error: any) {
      // If related tables don't exist or vehicleType enum conversion fails, use raw SQL
      if (error.message?.includes('parking_amenities') || 
          error.message?.includes('parking_images') ||
          error.message?.includes('vehicleType') ||
          error.message?.includes('vehicle_type')) {
        
        // Use raw SQL to handle enum conversion
        const rawQuery = `
          SELECT 
            ps.id,
            ps.owner_id as "ownerId",
            ps.name,
            ps.address,
            ps.latitude,
            ps.longitude,
            ps.type,
            ps.vehicle_type::text as "vehicleType",
            ps.description,
            ps.status,
            ps.price_per_hour as "pricePerHour",
            ps.price_per_day as "pricePerDay",
            ps.price_per_month as "pricePerMonth",
            ps.created_at as "createdAt",
            ps.updated_at as "updatedAt",
            ps.deleted_at as "deletedAt"
          FROM parking_spaces ps
          WHERE ps.id = '${parkingId.replace(/'/g, "''")}'
        `;
        
        const rawResults = await this.prisma.$queryRawUnsafe(rawQuery);
        const rawParking = (rawResults as any[])[0];
        
        if (!rawParking) {
          throw new NotFoundException('Parking space not found');
        }
        
        // Fetch owner separately
        const owner = await this.prisma.user.findUnique({
          where: { id: rawParking.ownerId },
          select: { id: true, name: true, email: true },
        });
        
        parking = {
          ...rawParking,
          vehicleType: rawParking.vehicleType as VehicleTypeString,
          owner: owner || null,
          amenities: [],
          images: [],
        } as any;
      } else {
        throw error;
      }
    }

    // Add amenities, images, and time slots if provided
    if (amenities && amenities.length > 0) {
      await this.prisma.parkingAmenity.createMany({
        data: amenities.map((name) => ({
          parkingId,
          amenityName: name,
        })),
      });
    }

    if (images && images.length > 0) {
      await this.prisma.parkingImage.createMany({
        data: images.map((url, index) => ({
          parkingId,
          imageUrl: url,
          displayOrder: index,
          isPrimary: index === 0,
        })),
      });
    }

    if (timeSlots) {
      await this.prisma.parkingTimeSlot.create({
        data: {
          parkingId,
          startHour: timeSlots.startHour,
          endHour: timeSlots.endHour,
          availableHours: timeSlots.availableHours,
        },
      });
    }

    // Fetch updated parking with all relations (exclude location field)
    let updatedParking;
    try {
      updatedParking = await this.prisma.parkingSpace.findUnique({
        where: { id: parkingId },
        select: {
          id: true,
          ownerId: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          type: true,
          vehicleType: true,
          description: true,
          status: true,
          pricePerHour: true,
          pricePerDay: true,
          pricePerMonth: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          owner: true,
          amenities: true,
          images: true,
        },
      });
    } catch (error: any) {
      // If related tables don't exist or vehicleType enum conversion fails, use raw SQL
      if (error.message?.includes('parking_amenities') || 
          error.message?.includes('parking_images') ||
          error.message?.includes('vehicleType') ||
          error.message?.includes('vehicle_type')) {
        
        // Use raw SQL to handle enum conversion
        const rawQuery = `
          SELECT 
            ps.id,
            ps.owner_id as "ownerId",
            ps.name,
            ps.address,
            ps.latitude,
            ps.longitude,
            ps.type,
            ps.vehicle_type::text as "vehicleType",
            ps.description,
            ps.status,
            ps.price_per_hour as "pricePerHour",
            ps.price_per_day as "pricePerDay",
            ps.price_per_month as "pricePerMonth",
            ps.created_at as "createdAt",
            ps.updated_at as "updatedAt",
            ps.deleted_at as "deletedAt"
          FROM parking_spaces ps
          WHERE ps.id = '${parkingId.replace(/'/g, "''")}'
        `;
        
        const rawResults = await this.prisma.$queryRawUnsafe(rawQuery);
        const rawParking = (rawResults as any[])[0];
        
        if (!rawParking) {
          throw new NotFoundException('Parking space not found');
        }
        
        // Fetch owner separately
        const owner = await this.prisma.user.findUnique({
          where: { id: rawParking.ownerId },
          select: { id: true, name: true, email: true },
        });
        
        updatedParking = {
          ...rawParking,
          vehicleType: rawParking.vehicleType as VehicleTypeString,
          owner: owner || null,
          amenities: [],
          images: [],
        } as any;
      } else {
        throw error;
      }
    }

    return this.mapToResponseDto(updatedParking);
  }

  async findAll(query: SearchParkingDto): Promise<PaginatedResponse<ParkingResponseDto>> {
    const { page = 1, limit = 10, latitude, longitude, radius = 10, status = 'approved', ownerId, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      deletedAt: null,
      status: status,
    };

    // Apply owner filter if provided
    if (ownerId) {
      where.ownerId = ownerId;
    }

    // Apply filters
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.vehicleType) {
      where.vehicleType = filters.vehicleType;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.pricePerDay = {};
      if (filters.minPrice !== undefined) {
        where.pricePerDay.gte = filters.minPrice.toString();
      }
      if (filters.maxPrice !== undefined) {
        where.pricePerDay.lte = filters.maxPrice.toString();
      }
    }

    // Handle PostGIS search for nearby parking
    let orderBy: any = {};
    let parkings: any[];

    if (latitude && longitude) {
      // Use raw SQL for PostGIS search
      const radiusMeters = (radius || 10) * 1000;
      const query = `
        SELECT 
          ps.*,
          ST_Distance(
            ps.location::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) / 1000.0 AS distance_km
        FROM parking_spaces ps
        WHERE 
          ps.deleted_at IS NULL
          AND ps.status = '${status}'
          ${filters.type ? `AND ps.type = '${filters.type}'` : ''}
          ${filters.vehicleType ? `AND ps.vehicle_type = '${filters.vehicleType}'` : ''}
          ${filters.minPrice !== undefined ? `AND ps.price_per_day >= ${filters.minPrice}` : ''}
          ${filters.maxPrice !== undefined ? `AND ps.price_per_day <= ${filters.maxPrice}` : ''}
          ${ownerId ? `AND ps.owner_id = '${ownerId}'` : ''}
          AND ST_DWithin(
            ps.location::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY distance_km ASC
        LIMIT ${limit} OFFSET ${skip}
      `;

      const results = await this.prisma.$queryRawUnsafe(query);
      parkings = results as any[];

      // Get full parking data with relations (exclude location field as it's PostGIS geography)
      const parkingIds = parkings.map((p) => p.id);
      let fullParkings;
      try {
        fullParkings = await this.prisma.parkingSpace.findMany({
          where: {
            id: { in: parkingIds },
          },
          select: {
            id: true,
            ownerId: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            type: true,
            vehicleType: true,
            description: true,
            status: true,
            pricePerHour: true,
            pricePerDay: true,
            pricePerMonth: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            owner: true,
            amenities: true,
            images: true,
          },
        });
      } catch (error: any) {
        // If related tables don't exist, fetch without relations
        if (error.message?.includes('parking_amenities') || error.message?.includes('parking_images')) {
          fullParkings = await this.prisma.parkingSpace.findMany({
            where: {
              id: { in: parkingIds },
            },
            select: {
              id: true,
              ownerId: true,
              name: true,
              address: true,
              latitude: true,
              longitude: true,
              type: true,
              vehicleType: true,
              description: true,
              status: true,
              pricePerHour: true,
              pricePerDay: true,
              pricePerMonth: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
              owner: true,
            },
          });
          // Add empty arrays for missing relations
          fullParkings = fullParkings.map((p: any) => ({ ...p, amenities: [], images: [] }));
        } else {
          throw error;
        }
      }

      // Merge distance data
      parkings = fullParkings.map((p) => {
        const distanceData = parkings.find((pd) => pd.id === p.id);
        return { ...p, distance: distanceData?.distance_km };
      });
    } else {
      // Regular query without location
      if (filters.sortBy === 'price-low') {
        orderBy = { pricePerDay: 'asc' };
      } else if (filters.sortBy === 'price-high') {
        orderBy = { pricePerDay: 'desc' };
      } else {
        orderBy = { createdAt: 'desc' };
      }

      try {
        parkings = await this.prisma.parkingSpace.findMany({
          where,
          select: {
            id: true,
            ownerId: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            type: true,
            vehicleType: true,
            description: true,
            status: true,
            pricePerHour: true,
            pricePerDay: true,
            pricePerMonth: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            owner: true,
            amenities: true,
            images: true,
          },
          orderBy,
          skip,
          take: limit,
        });
      } catch (error: any) {
        // If related tables don't exist or vehicleType enum conversion fails, use raw SQL
        if (error.message?.includes('parking_amenities') || 
            error.message?.includes('parking_images') || 
            error.message?.includes('vehicleType') ||
            error.message?.includes('vehicle_type')) {
          
          // Build WHERE clause with proper escaping
          const whereConditions: string[] = ["ps.deleted_at IS NULL", `ps.status = '${status.replace(/'/g, "''")}'`];
          
          if (filters.type) {
            whereConditions.push(`ps.type = '${filters.type.replace(/'/g, "''")}'`);
          }
          if (filters.vehicleType) {
            whereConditions.push(`ps.vehicle_type = '${filters.vehicleType.replace(/'/g, "''")}'`);
          }
          if (ownerId) {
            whereConditions.push(`ps.owner_id = '${ownerId.replace(/'/g, "''")}'`);
          }
          
          // Build ORDER BY
          let orderByClause = "ps.created_at DESC";
          if (filters.sortBy === 'price-low') {
            orderByClause = "ps.price_per_day ASC";
          } else if (filters.sortBy === 'price-high') {
            orderByClause = "ps.price_per_day DESC";
          }
          
          // Use raw SQL to handle enum conversion - cast enum to text
          const rawQuery = `
            SELECT 
              ps.id,
              ps.owner_id as "ownerId",
              ps.name,
              ps.address,
              ps.latitude,
              ps.longitude,
              ps.type,
              ps.vehicle_type::text as "vehicleType",
              ps.description,
              ps.status,
              ps.price_per_hour as "pricePerHour",
              ps.price_per_day as "pricePerDay",
              ps.price_per_month as "pricePerMonth",
              ps.created_at as "createdAt",
              ps.updated_at as "updatedAt",
              ps.deleted_at as "deletedAt"
            FROM parking_spaces ps
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY ${orderByClause}
            LIMIT ${limit} OFFSET ${skip}
          `;
          
          const rawResults = await this.prisma.$queryRawUnsafe(rawQuery);
          parkings = rawResults as any[];
          
          // Fetch owner data separately
          const ownerIds = [...new Set(parkings.map((p: any) => p.ownerId))];
          const owners = await this.prisma.user.findMany({
            where: { id: { in: ownerIds } },
            select: { id: true, name: true, email: true },
          });
          
          // Merge owner data and add empty arrays for missing relations
          parkings = parkings.map((p: any) => {
            const owner = owners.find((o) => o.id === p.ownerId);
            return {
              ...p,
              vehicleType: (p.vehicleType || p.vehicle_type) as VehicleTypeString,
              owner: owner || null,
              amenities: [],
              images: [],
            };
          });
        } else {
          throw error;
        }
      }
    }

    // Get total count
    const total = await this.prisma.parkingSpace.count({ where });

    const data = parkings.map((p) => this.mapToResponseDto(p));
    return new PaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, userId?: string, userLat?: number, userLon?: number): Promise<ParkingResponseDto> {
    let parking;
    try {
      parking = await this.prisma.parkingSpace.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          type: true,
          vehicleType: true,
          description: true,
          status: true,
          pricePerHour: true,
          pricePerDay: true,
          pricePerMonth: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          owner: true,
          amenities: true,
          images: true,
          timeSlots: true,
        },
      });
    } catch (error: any) {
      // If related tables don't exist or vehicleType enum conversion fails, use raw SQL
      if (error.message?.includes('parking_amenities') || 
          error.message?.includes('parking_images') || 
          error.message?.includes('parking_time_slots') ||
          error.message?.includes('vehicleType') ||
          error.message?.includes('vehicle_type')) {
        
        // Use raw SQL to handle enum conversion
        const rawQuery = `
          SELECT 
            ps.id,
            ps.owner_id as "ownerId",
            ps.name,
            ps.address,
            ps.latitude,
            ps.longitude,
            ps.type,
            ps.vehicle_type::text as "vehicleType",
            ps.description,
            ps.status,
            ps.price_per_hour as "pricePerHour",
            ps.price_per_day as "pricePerDay",
            ps.price_per_month as "pricePerMonth",
            ps.created_at as "createdAt",
            ps.updated_at as "updatedAt",
            ps.deleted_at as "deletedAt"
          FROM parking_spaces ps
          WHERE ps.id = '${id.replace(/'/g, "''")}' AND ps.deleted_at IS NULL
        `;
        
        const rawResults = await this.prisma.$queryRawUnsafe(rawQuery);
        const rawParking = (rawResults as any[])[0];
        
        if (!rawParking) {
          throw new NotFoundException('Parking space not found');
        }
        
        // Fetch owner separately
        const owner = await this.prisma.user.findUnique({
          where: { id: rawParking.ownerId },
          select: { id: true, name: true, email: true },
        });
        
        parking = {
          ...rawParking,
          vehicleType: rawParking.vehicleType as VehicleTypeString,
          owner: owner || null,
          amenities: [],
          images: [],
          timeSlots: null,
        } as any;
      } else {
        throw error;
      }
    }

    if (!parking) {
      throw new NotFoundException('Parking space not found');
    }

    let distance: number | undefined;

    // Calculate distance if user location provided
    if (userLat && userLon) {
      const result = await this.prisma.$queryRawUnsafe(
        `
        SELECT ST_Distance(
          ps.location::geography,
          ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography
        ) / 1000.0 AS distance_km
        FROM parking_spaces ps
        WHERE ps.id = '${id}'
        `,
      );
      distance = (result as Array<{ distance_km: number }>)[0]?.distance_km;
    }

    return this.mapToResponseDto(parking, distance);
  }

  async update(id: string, ownerId: string, updateParkingDto: UpdateParkingDto): Promise<ParkingResponseDto> {
    const parking = await this.prisma.parkingSpace.findFirst({
      where: { id, deletedAt: null },
    });

    if (!parking) {
      throw new NotFoundException('Parking space not found');
    }

    if (parking.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own parking spaces');
    }

    const { latitude, longitude, amenities, images, timeSlots, ...updateData } = updateParkingDto;

    const updatePayload: any = { ...updateData };

    if (latitude !== undefined && longitude !== undefined) {
      updatePayload.latitude = latitude.toString();
      updatePayload.longitude = longitude.toString();
      updatePayload.location = `POINT(${longitude} ${latitude})`;
    }

    if (amenities !== undefined) {
      // Delete existing amenities and create new ones
      await this.prisma.parkingAmenity.deleteMany({
        where: { parkingId: id },
      });
      updatePayload.amenities = {
        create: amenities.map((name) => ({ amenityName: name })),
      };
    }

    if (images !== undefined) {
      // Delete existing images and create new ones
      await this.prisma.parkingImage.deleteMany({
        where: { parkingId: id },
      });
      updatePayload.images = {
        create: images.map((url, index) => ({
          imageUrl: url,
          displayOrder: index,
          isPrimary: index === 0,
        })),
      };
    }

    if (timeSlots !== undefined) {
      updatePayload.timeSlots = {
        upsert: {
          create: {
            startHour: timeSlots.startHour,
            endHour: timeSlots.endHour,
            availableHours: timeSlots.availableHours,
          },
          update: {
            startHour: timeSlots.startHour,
            endHour: timeSlots.endHour,
            availableHours: timeSlots.availableHours,
          },
        },
      };
    }

    let updated;
    try {
      updated = await this.prisma.parkingSpace.update({
        where: { id },
        data: updatePayload,
        select: {
          id: true,
          ownerId: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          type: true,
          vehicleType: true,
          description: true,
          status: true,
          pricePerHour: true,
          pricePerDay: true,
          pricePerMonth: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          owner: true,
          amenities: true,
          images: true,
        },
      });
    } catch (error: any) {
      // If related tables don't exist or vehicleType enum conversion fails, use raw SQL
      if (error.message?.includes('parking_amenities') || 
          error.message?.includes('parking_images') ||
          error.message?.includes('vehicleType') ||
          error.message?.includes('vehicle_type')) {
        
        // First update the parking space
        await this.prisma.$executeRawUnsafe(`
          UPDATE parking_spaces 
          SET 
            name = '${updatePayload.name?.replace(/'/g, "''") || ''}',
            address = '${updatePayload.address?.replace(/'/g, "''") || ''}',
            type = '${updatePayload.type || ''}',
            vehicle_type = '${updatePayload.vehicleType?.replace(/'/g, "''") || ''}',
            description = ${updatePayload.description ? `'${updatePayload.description.replace(/'/g, "''")}'` : 'NULL'},
            status = '${updatePayload.status || ''}',
            price_per_hour = ${updatePayload.pricePerHour || 'NULL'},
            price_per_day = ${updatePayload.pricePerDay || 0},
            price_per_month = ${updatePayload.pricePerMonth || 0},
            updated_at = NOW()
          WHERE id = '${id.replace(/'/g, "''")}'
        `);
        
        // Then fetch using raw SQL
        const rawQuery = `
          SELECT 
            ps.id,
            ps.owner_id as "ownerId",
            ps.name,
            ps.address,
            ps.latitude,
            ps.longitude,
            ps.type,
            ps.vehicle_type::text as "vehicleType",
            ps.description,
            ps.status,
            ps.price_per_hour as "pricePerHour",
            ps.price_per_day as "pricePerDay",
            ps.price_per_month as "pricePerMonth",
            ps.created_at as "createdAt",
            ps.updated_at as "updatedAt",
            ps.deleted_at as "deletedAt"
          FROM parking_spaces ps
          WHERE ps.id = '${id.replace(/'/g, "''")}'
        `;
        
        const rawResults = await this.prisma.$queryRawUnsafe(rawQuery);
        const rawParking = (rawResults as any[])[0];
        
        // Fetch owner separately
        const owner = await this.prisma.user.findUnique({
          where: { id: rawParking.ownerId },
          select: { id: true, name: true, email: true },
        });
        
        updated = {
          ...rawParking,
          vehicleType: rawParking.vehicleType as VehicleTypeString,
          owner: owner || null,
          amenities: [],
          images: [],
        } as any;
      } else {
        throw error;
      }
    }

    return this.mapToResponseDto(updated);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const parking = await this.prisma.parkingSpace.findFirst({
      where: { id, deletedAt: null },
    });

    if (!parking) {
      throw new NotFoundException('Parking space not found');
    }

    if (parking.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own parking spaces');
    }

    // Soft delete
    await this.prisma.parkingSpace.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private mapToResponseDto(parking: any, distance?: number): ParkingResponseDto {
    return {
      id: parking.id,
      name: parking.name,
      address: parking.address,
      latitude: parseFloat(parking.latitude),
      longitude: parseFloat(parking.longitude),
      type: parking.type,
      vehicleType: parking.vehicleType as VehicleTypeString,
      description: parking.description,
      status: parking.status,
      pricePerHour: parking.pricePerHour ? parseFloat(parking.pricePerHour) : undefined,
      pricePerDay: parseFloat(parking.pricePerDay),
      pricePerMonth: parseFloat(parking.pricePerMonth),
      distance,
      amenities: parking.amenities?.map((a: any) => a.amenityName) || [],
      images: parking.images?.map((img: any) => img.imageUrl).sort((a: any, b: any) => a.displayOrder - b.displayOrder) || [],
      ownerId: parking.ownerId,
      ownerName: parking.owner?.name || '',
      ownerVerified: parking.owner?.verified || false,
      createdAt: parking.createdAt,
      updatedAt: parking.updatedAt,
    };
  }
}

