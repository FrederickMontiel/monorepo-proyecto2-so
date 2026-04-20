import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from '../entities/subcategory.entity';
import { CreateSubcategoryDto } from '../dto/create-subcategory.dto';

@Injectable()
export class SubcategoryService {
    constructor(
        @InjectRepository(Subcategory)
        private subcategoryRepository: Repository<Subcategory>,
    ) { }

    async findAll(): Promise<Subcategory[]> {
        return this.subcategoryRepository.find({
            relations: ['category'],
        });
    }

    async findByCategory(categoryId: number): Promise<Subcategory[]> {
        return this.subcategoryRepository.find({
            where: { categoryId },
            relations: ['category'],
        });
    }

    async findOne(id: number): Promise<Subcategory> {
        const subcategory = await this.subcategoryRepository.findOne({
            where: { id },
            relations: ['category'],
        });

        if (!subcategory) {
            throw new NotFoundException(`Subcategory with ID ${id} not found`);
        }

        return subcategory;
    }

    async create(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
        const subcategory = this.subcategoryRepository.create(createSubcategoryDto);
        return this.subcategoryRepository.save(subcategory);
    }

    async remove(id: number): Promise<void> {
        const result = await this.subcategoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Subcategory with ID ${id} not found`);
        }
    }
}
