import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PointOfInterestService } from '../services/point-of-interest.service';
import { CreatePointOfInterestDto } from '../dto/create-point-of-interest.dto';

@Controller('points-of-interest')
export class PointOfInterestController {
    constructor(private readonly pointService: PointOfInterestService) { }

    @Get()
    findAll(@Query('subcategoryId') subcategoryId?: string) {
        if (subcategoryId) {
            return this.pointService.findBySubcategory(parseInt(subcategoryId));
        }
        return this.pointService.findAll();
    }

    @Get('nearby')
    findNearby(
        @Query('latitude') latitude: string,
        @Query('longitude') longitude: string,
        @Query('radius') radius?: string,
    ) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radiusInMeters = radius ? parseFloat(radius) : 5000;

        return this.pointService.findNearby(lat, lng, radiusInMeters);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.pointService.findOne(id);
    }

    @Post()
    create(@Body() createPointDto: CreatePointOfInterestDto) {
        return this.pointService.create(createPointDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.pointService.remove(id);
    }
}
