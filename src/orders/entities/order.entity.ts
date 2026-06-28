import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'orders' })
export class Order {

    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiHideProperty()
    @ManyToOne(
        () => User,
        ( user ) => user.orders,
        { eager: true }
    )
    user: User;

    @ApiProperty()
    @OneToMany(
        () => OrderItem,
        ( orderItem ) => orderItem.order,
        { cascade: true, eager: true }
    )
    items: OrderItem[];

    @ApiProperty()
    @Column('float')
    total: number;

    @ApiProperty()
    @Column('int')
    totalItems: number;

    @ApiProperty()
    @Column('text')
    status: string;

    @ApiProperty()
    @Column('bool', { default: false })
    paid: boolean;

    @ApiProperty()
    @Column('text', { nullable: true })
    stripePaymentIntentId: string;

    @ApiProperty()
    @Column('text')
    shippingAddress: string;

    @ApiProperty()
    @Column('text')
    shippingCity: string;

    @ApiProperty()
    @Column('text')
    shippingState: string;

    @ApiProperty()
    @Column('text')
    shippingZip: string;

    @ApiProperty()
    @Column('text')
    shippingCountry: string;

    @ApiProperty()
    @Column('text')
    createdAt: string;

}
