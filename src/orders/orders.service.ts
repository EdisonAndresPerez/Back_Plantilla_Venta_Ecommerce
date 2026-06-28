import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderItem } from './entities';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    try {
      const { items, ...orderData } = createOrderDto;

      const orderItems = items.map((item) =>
        this.orderItemRepository.create(item),
      );

      const order = this.orderRepository.create({
        ...orderData,
        status: 'pending',
        paid: false,
        createdAt: new Date().toISOString(),
        user,
        items: orderItems,
      });

      await this.orderRepository.save(order);
      return order;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error creating order');
    }
  }

  async findAllByUser(user: User) {
    return this.orderRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async updateStatus(id: string, status: string, paid: boolean, stripePaymentIntentId: string) {
    const order = await this.findOne(id);
    order.status = status;
    order.paid = paid;
    if (stripePaymentIntentId) {
      order.stripePaymentIntentId = stripePaymentIntentId;
    }
    await this.orderRepository.save(order);
    return order;
  }

  async remove(id: string, user: User) {
    const order = await this.findOne(id);
    if (order.user.id !== user.id) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.remove(order);
  }

  async findAll() {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });
  }
}
