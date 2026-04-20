import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Subcategory } from './subcategory.entity';

@Entity('points_of_interest')
export class PointOfInterest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'subcategory_id' })
    subcategoryId: number;

    @Column({ length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'double precision' })
    latitude: number;

    @Column({ type: 'double precision' })
    longitude: number;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
    location: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.pointsOfInterest)
    @JoinColumn({ name: 'subcategory_id' })
    subcategory: Subcategory;
}
