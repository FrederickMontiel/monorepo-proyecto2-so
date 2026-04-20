import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SubcategoryService } from '../services/subcategory.service';
import { CreateSubcategoryDto } from '../dto/create-subcategory.dto';

@Controller('subcategories')
export class SubcategoryController {
    constructor(private readonly subcategoryService: SubcategoryService) { }

    @Get()
    findAll(@Query('categoryId') categoryId?: string) {
        if (categoryId) {
            return this.subcategoryService.findByCategory(parseInt(categoryId));
        }
        return this.subcategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subcategoryService.findOne(id);
    }

    @Post()
    create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
        return this.subcategoryService.create(createSubcategoryDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.subcategoryService.remove(id);
    }
}
