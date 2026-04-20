import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { PointOfInterest } from './entities/point-of-interest.entity';
import { CategoryController } from './controllers/category.controller';
import { SubcategoryController } from './controllers/subcategory.controller';
import { PointOfInterestController } from './controllers/point-of-interest.controller';
import { CategoryService } from './services/category.service';
import { SubcategoryService } from './services/subcategory.service';
import { PointOfInterestService } from './services/point-of-interest.service';

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
	    envFilePath: '../.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USER'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_NAME'),
                entities: [Category, Subcategory, PointOfInterest],
                synchronize: false, // No sincronizar automáticamente, ya que usamos migraciones SQL
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Category, Subcategory, PointOfInterest]),
    ],
    controllers: [
        CategoryController,
        SubcategoryController,
        PointOfInterestController,
    ],
    providers: [
        CategoryService,
        SubcategoryService,
        PointOfInterestService,
    ],
})
export class AppModule { }
