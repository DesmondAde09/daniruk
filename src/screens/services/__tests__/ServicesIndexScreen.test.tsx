import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getServices } from '@/data/services';

import { ServicesIndexScreen } from '../ServicesIndexScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@/data/services', () => {
  const actual = jest.requireActual('@/data/services');
  return { ...actual, getServices: jest.fn() };
});

const mockGetServices = getServices as jest.Mock;
const mockPush = router.push as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderIndex() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ServicesIndexScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const actual = jest.requireActual('@/data/services');
  mockGetServices.mockImplementation(actual.getServices);
});

describe('Services index screen', () => {
  it('lists all four services with their taglines', async () => {
    await renderIndex();

    expect(await screen.findByText('Flights')).toBeTruthy();
    expect(screen.getByText('Book local flights')).toBeTruthy();
    expect(screen.getByText('Electricity')).toBeTruthy();
    expect(screen.getByText('Prepaid & postpaid')).toBeTruthy();
    expect(screen.getByText('Airtime')).toBeTruthy();
    expect(screen.getByText('Instant top-up')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();
    expect(screen.getByText('Bundles that last')).toBeTruthy();
  });

  it.each([
    ['flights', '/services/flights'],
    ['electricity', '/services/electricity'],
    ['airtime', '/services/airtime'],
    ['data', '/services/data'],
  ])('routes the %s row to its flow', async (id, route) => {
    await renderIndex();
    await screen.findByText('Flights');

    await fireEvent.press(screen.getByTestId(`service-row-${id}`));

    expect(mockPush).toHaveBeenCalledWith(route);
  });

  it('shows a retryable error state when the catalogue fails', async () => {
    mockGetServices.mockRejectedValueOnce(new Error('boom'));
    await renderIndex();

    expect(await screen.findByText("Couldn't load services")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('Flights')).toBeTruthy();
  });
});
