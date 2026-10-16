import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the label for each status', async () => {
    await render(
      <>
        <StatusBadge status="successful" />
        <StatusBadge status="pending" />
        <StatusBadge status="failed" />
      </>,
    );
    expect(screen.getByText('Successful')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('Failed')).toBeTruthy();
  });
});
