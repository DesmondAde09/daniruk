import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import type { Transaction } from '@/data/types';

import { TransactionRow } from '../TransactionRow';

const baseTransaction: Transaction = {
  id: 'txn-1',
  type: 'trade',
  title: 'Apple Gift Card',
  amountKobo: 7125000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-284910',
  createdAt: new Date().toISOString(),
};

describe('TransactionRow', () => {
  it('renders title, reference, signed credit amount and status badge', async () => {
    await render(<TransactionRow transaction={baseTransaction} />);
    expect(screen.getByText('Apple Gift Card')).toBeTruthy();
    expect(screen.getByText('+₦71,250')).toBeTruthy();
    expect(screen.getByText('Successful')).toBeTruthy();
    expect(screen.getByText(/DNR-284910/)).toBeTruthy();
  });

  it('renders a debit amount with a minus sign', async () => {
    const debit: Transaction = {
      ...baseTransaction,
      id: 'txn-2',
      type: 'withdraw',
      title: 'Bank withdrawal',
      amountKobo: -5000000,
      status: 'pending',
    };
    await render(<TransactionRow transaction={debit} />);
    expect(screen.getByText('−₦50,000')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<TransactionRow transaction={baseTransaction} onPress={onPress} />);
    await fireEvent.press(screen.getByText('Apple Gift Card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
