import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { PointOfInterest } from './point-of-interest.entity';

@Entity('subcategory')
export class Subcategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'category_id' })
    categoryId: number;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Category, (category) => category.subcategories)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => PointOfInterest, (point) => point.subcategory)
    pointsOfInterest: PointOfInterest[];
}
