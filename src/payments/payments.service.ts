import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger('PaymentsService');

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured');
    }
    this.stripe = new Stripe(stripeSecretKey ?? '');
  }

  async createPaymentIntent(orderId: string, amount: number, userId?: string, currency: string = 'usd') {
    try {
      const metadata: Record<string, string> = { orderId };
      if (userId) metadata.userId = userId;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      this.logger.error('Error creating payment intent', error?.message ?? error);
      if (error?.type === 'StripeInvalidRequestError' || error?.code === 'authentication_error') {
        throw new BadRequestException('Error de configuración de pago. Revisa la clave de Stripe.');
      }
      throw new InternalServerErrorException('Error al procesar el pago');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El pago no se ha completado');
      }

      const orderId = paymentIntent.metadata.orderId;
      if (!orderId) {
        throw new BadRequestException('PaymentIntent no está vinculado a una orden');
      }

      return orderId;
    } catch (error: any) {
      this.logger.error('Error confirming payment intent', error?.message ?? error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al verificar el pago');
    }
  }

  constructWebhookEvent(payload: Buffer, sig: string, webhookSecret: string) {
    return this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  }
}
