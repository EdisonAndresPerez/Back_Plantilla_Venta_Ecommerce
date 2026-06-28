import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

import { Order } from './order.entity';

@Entity({ name: 'order_items' })
export class OrderItem {

    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiHideProperty()
    @ManyToOne(
        () => Order,
        ( order ) => order.items,
        { onDelete: 'CASCADE' }
    )
    order: Order;

    @ApiProperty()
    @Column('text')
    productId: string;

    @ApiProperty()
    @Column('text')
    productTitle: string;

    @ApiProperty()
    @Column('float')
    productPrice: number;

    @ApiProperty()
    @Column('text')
    productImage: string;

    @ApiProperty()
    @Column('text')
    size: string;

    @ApiProperty()
    @Column('int')
    quantity: number;

}
