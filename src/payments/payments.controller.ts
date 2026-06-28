import { Body, Controller, Post, Req, Headers, BadRequestException } from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('create-payment-intent')
  @Auth()
  async createPaymentIntent(
    @Body('orderId') orderId: string,
    @GetUser() user: User,
  ) {
    const order = await this.ordersService.findOne(orderId);

    if (order.user.id !== user.id) {
      throw new BadRequestException('Unauthorized');
    }

    return this.paymentsService.createPaymentIntent(orderId, order.total, user.id);
  }

  @Post('confirm')
  @Auth()
  async confirmPayment(
    @Body('paymentIntentId') paymentIntentId: string,
    @GetUser() user: User,
  ) {
    const orderId = await this.paymentsService.confirmPaymentIntent(paymentIntentId);
    const order = await this.ordersService.findOne(orderId);

    if (order.user.id !== user.id) {
      throw new BadRequestException('Unauthorized');
    }

    await this.ordersService.updateStatus(
      orderId,
      'confirmed',
      true,
      paymentIntentId,
    );

    return { ok: true, order };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !sig) {
      return { received: true };
    }

    let event;
    try {
      event = this.paymentsService.constructWebhookEvent(
        req.rawBody!,
        sig,
        webhookSecret,
      );
    } catch {
      return { received: true };
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await this.ordersService.updateStatus(
          orderId,
          'confirmed',
          true,
          paymentIntent.id,
        );
      }
    }

    return { received: true };
  }
}
