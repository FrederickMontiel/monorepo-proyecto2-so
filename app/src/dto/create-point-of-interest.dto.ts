import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class CreatePointOfInterestDto {
    @IsNumber()
    @IsNotEmpty()
    subcategoryId: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(-180)
    @Max(180)
    longitude: number;
}
