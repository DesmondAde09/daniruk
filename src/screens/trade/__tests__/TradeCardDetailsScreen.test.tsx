import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getGiftCardBrand } from '@/data/trade';

import { TradeCardDetailsScreen } from '../TradeCardDetailsScreen';

let mockBrandId = 'apple';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ brandId: mockBrandId }),
}));

jest.mock('@/data/trade', () => ({ getGiftCardBrand: jest.fn() }));

const mockGetGiftCardBrand = getGiftCardBrand as jest.Mock;
const mockPush = router.push as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderDetails() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <TradeCardDetailsScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockBrandId = 'apple';
  mockGetGiftCardBrand.mockImplementation(jest.requireActual('@/data/trade').getGiftCardBrand);
});

describe('Trade card details screen', () => {
  it('renders the brand card with rate and accepted range', async () => {
    await renderDetails();

    expect(await screen.findByText('Apple Gift Card')).toBeTruthy();
    expect(screen.getByText('₦1,425/$')).toBeTruthy();
    expect(screen.getByText('This card accepts $10 – $500.')).toBeTruthy();
    expect(screen.getByText('United States — USD')).toBeTruthy();
  });

  it('blocks Continue until a valid amount is entered', async () => {
    await renderDetails();
    await screen.findByText('Apple Gift Card');

    await fireEvent.press(screen.getByText('Continue'));
    expect(mockPush).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('usd-amount-input'), '50');
    await fireEvent.press(screen.getByText('Continue'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/trade/review' }),
    );
  });

  it('shows a validation error below the brand minimum and blocks Continue', async () => {
    await renderDetails();
    await screen.findByText('Apple Gift Card');

    await fireEvent.changeText(screen.getByTestId('usd-amount-input'), '5');

    expect(await screen.findByText('Card value must be at least 10')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continue'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('routes to the review step with the entered details', async () => {
    await renderDetails();
    await screen.findByText('Apple Gift Card');

    await fireEvent.changeText(screen.getByTestId('usd-amount-input'), '50');
    await fireEvent.press(screen.getByTestId('card-photo-picker'));
    expect(screen.getByText('Card photo attached')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/trade/review',
      params: {
        brandId: 'apple',
        amountUsd: '50',
        region: 'United States — USD',
        photoAttached: 'true',
      },
    });
  });

  it('shows a retryable error state for an unknown brand', async () => {
    mockBrandId = 'nope';
    await renderDetails();

    expect(await screen.findByText("Couldn't load this brand")).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
