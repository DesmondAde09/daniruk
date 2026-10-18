import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import type { Wallet } from '@/data/types';

import { WalletCard } from '../WalletCard';

const wallet: Wallet = {
  ngn: { balanceKobo: 34820000 },
  crypto: [{ asset: 'BTC', balance: '0.0048', address: 'bc1qmockaddress' }],
};

async function renderCard(overrides?: Partial<Parameters<typeof WalletCard>[0]>) {
  const props = {
    wallet,
    balanceHidden: false,
    onToggleBalance: jest.fn(),
    onReceive: jest.fn(),
    onAddMoney: jest.fn(),
    onTransfer: jest.fn(),
    onWithdraw: jest.fn(),
    ...overrides,
  };
  await render(<WalletCard {...props} />);
  return props;
}

describe('WalletCard', () => {
  it('shows the formatted NGN balance and crypto amount', async () => {
    await renderCard();
    expect(screen.getByText('₦348,200.00')).toBeTruthy();
    expect(screen.getByText('0.0048 BTC')).toBeTruthy();
  });

  it('masks the balance when balanceHidden', async () => {
    await renderCard({ balanceHidden: true });
    expect(screen.getByText('₦••••••')).toBeTruthy();
    expect(screen.queryByText('₦348,200.00')).toBeNull();
  });

  it('eye toggle calls onToggleBalance', async () => {
    const props = await renderCard();
    await fireEvent.press(screen.getByLabelText('Hide balance'));
    expect(props.onToggleBalance).toHaveBeenCalledTimes(1);
  });

  it('Receive, Add money, Transfer and Withdraw buttons call their handlers', async () => {
    const props = await renderCard();
    await fireEvent.press(screen.getByText('Receive'));
    await fireEvent.press(screen.getByText('Add money'));
    await fireEvent.press(screen.getByText('Transfer'));
    await fireEvent.press(screen.getByText('Withdraw'));
    expect(props.onReceive).toHaveBeenCalledTimes(1);
    expect(props.onAddMoney).toHaveBeenCalledTimes(1);
    expect(props.onTransfer).toHaveBeenCalledTimes(1);
    expect(props.onWithdraw).toHaveBeenCalledTimes(1);
  });
});
