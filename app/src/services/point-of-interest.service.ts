import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointOfInterest } from '../entities/point-of-interest.entity';
import { CreatePointOfInterestDto } from '../dto/create-point-of-interest.dto';

@Injectable()
export class PointOfInterestService {
    constructor(
        @InjectRepository(PointOfInterest)
        private pointRepository: Repository<PointOfInterest>,
    ) { }

    async findAll(): Promise<PointOfInterest[]> {
        return this.pointRepository.find({
            relations: ['subcategory', 'subcategory.category'],
        });
    }

    async findBySubcategory(subcategoryId: number): Promise<PointOfInterest[]> {
        return this.pointRepository.find({
            where: { subcategoryId },
            relations: ['subcategory', 'subcategory.category'],
        });
    }

    async findNearby(latitude: number, longitude: number, radiusInMeters: number = 5000): Promise<any[]> {
        const query = `
      SELECT 
        poi.*,
        ST_Distance(
          poi.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance
      FROM points_of_interest poi
      WHERE ST_DWithin(
        poi.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
      ORDER BY distance
    `;

        return this.pointRepository.query(query, [longitude, latitude, radiusInMeters]);
    }

    async findOne(id: number): Promise<PointOfInterest> {
        const point = await this.pointRepository.findOne({
            where: { id },
            relations: ['subcategory', 'subcategory.category'],
        });

        if (!point) {
            throw new NotFoundException(`Point of Interest with ID ${id} not found`);
        }

        return point;
    }

    async create(createPointDto: CreatePointOfInterestDto): Promise<PointOfInterest> {
        const { latitude, longitude, subcategoryId, name, description } = createPointDto;

        // Insertar usando query raw con ST_MakePoint para manejar correctamente geography
        const result = await this.pointRepository.query(
            `INSERT INTO points_of_interest (subcategory_id, name, description, latitude, longitude, location, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography, NOW(), NOW())
             RETURNING *`,
            [subcategoryId, name, description || null, latitude, longitude, longitude, latitude]
        );

        // Retornar el punto creado con sus relaciones
        return this.findOne(result[0].id);
    }

    async remove(id: number): Promise<void> {
        const result = await this.pointRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Point of Interest with ID ${id} not found`);
        }
    }
}
