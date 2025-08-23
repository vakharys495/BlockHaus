import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  // Add other relevant fields from ReadyWallet's API response
}

@Injectable()
export class ReadyWalletAdapter {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.ready.wallet';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('READY_WALLET_API_KEY');
  }

  async createPaymentIntent(
    amount: number, 
    currency: string
  ): Promise<PaymentIntentResponse> {
    const url = `${this.baseUrl}/v1/payment_intents`;
    
    try {
      const response: AxiosResponse<PaymentIntentResponse> = await axios.post(
        url,
        { amount, currency },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`ReadyWallet API error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to create payment intent');
    }
  }
}