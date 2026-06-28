import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [ConfigModule, OrdersModule, AuthModule],
})
export class PaymentsModule {}
