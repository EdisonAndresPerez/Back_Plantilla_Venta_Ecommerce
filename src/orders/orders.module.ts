import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderItem } from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    AuthModule,
  ],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
