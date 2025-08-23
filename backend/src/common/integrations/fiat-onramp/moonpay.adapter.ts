import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface MoonpayTransactionResponse {
  id: string;
  status: string;
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  walletAddress: string;
  // Add other relevant fields from Moonpay's API response
}

@Injectable()
export class MoonpayAdapter {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.moonpay.com';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('MOONPAY_API_KEY');
  }

  async createBuyTransaction(
    amount: number,
    currency: string,
    walletAddress: string,
  ): Promise<MoonpayTransactionResponse> {
    const url = `${this.baseUrl}/v3/transactions`;
    const params = {
      apiKey: this.apiKey,
      currencyCode: currency,
      baseCurrencyAmount: amount,
      walletAddress,
    };

    try {
      const response: AxiosResponse<MoonpayTransactionResponse> = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Moonpay API error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to create Moonpay transaction');
    }
  }
}