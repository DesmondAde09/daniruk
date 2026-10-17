import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getGiftCardBrand, getTradeQuote, submitTrade } from '@/data/trade';

import { TradeReviewScreen } from '../TradeReviewScreen';

let mockParams: Record<string, string> = {
  brandId: 'apple',
  amountUsd: '50',
  region: 'United States — USD',
  cardCode: 'XJ4K-92LM',
};

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

jest.mock('@/data/trade', () => ({
  getGiftCardBrand: jest.fn(),
  getTradeQuote: jest.fn(),
  submitTrade: jest.fn(),
}));

const mockGetGiftCardBrand = getGiftCardBrand as jest.Mock;
const mockGetTradeQuote = getTradeQuote as jest.Mock;
const mockSubmitTrade = submitTrade as jest.Mock;
const mockReplace = router.replace as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderReview() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <TradeReviewScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {
    brandId: 'apple',
    amountUsd: '50',
    region: 'United States — USD',
    cardCode: 'XJ4K-92LM',
  };
  const actual = jest.requireActual('@/data/trade');
  mockGetGiftCardBrand.mockImplementation(actual.getGiftCardBrand);
  mockGetTradeQuote.mockImplementation(actual.getTradeQuote);
  mockSubmitTrade.mockResolvedValue({
    id: 'txn_new',
    type: 'trade',
    title: 'Apple Gift Card',
    amountKobo: 7125000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-999999',
    createdAt: new Date().toISOString(),
  });
});

describe('Trade review screen', () => {
  it('renders the live quote math and the entered details', async () => {
    await renderReview();

    expect(await screen.findByText('You’ll receive')).toBeTruthy();
    expect(screen.getAllByText('₦71,250.00').length).toBeGreaterThan(0);
    expect(screen.getByText('$50.00 Apple Gift Card at ₦1,425/$')).toBeTruthy();
    expect(screen.getByText('United States — USD')).toBeTruthy();
    expect(screen.getByText('XJ4K-92LM')).toBeTruthy();
    expect(screen.getByText('Not attached')).toBeTruthy();
  });

  it('confirms the trade and routes to the success screen', async () => {
    await renderReview();
    await fireEvent.press(await screen.findByText('Confirm trade'));

    expect(screen.getByText('Confirm your trade')).toBeTruthy();

    await fireEvent.press(screen.getByText('Confirm & get paid'));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/trade/success',
        params: {
          transactionId: 'txn_new',
          amountKobo: '7125000',
          brandName: 'Apple Gift Card',
        },
      }),
    );
    expect(mockSubmitTrade).toHaveBeenCalledWith({
      brandId: 'apple',
      amountUsd: 50,
      cardCode: 'XJ4K-92LM',
    });
  });

  it('shows a retryable error state when trade details are missing', async () => {
    mockParams = {};
    await renderReview();

    expect(await screen.findByText("Couldn't get a quote")).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
