import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Button } from '../Button';

describe('Button', () => {
  it('renders the title and calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button title="Get started" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Get started'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks presses when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Log in securely" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByText('Log in securely'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner instead of the label when loading and blocks presses', async () => {
    const onPress = jest.fn();
    await render(<Button title="Create account" onPress={onPress} loading />);
    expect(screen.queryByText('Create account')).toBeNull();
    await fireEvent.press(screen.getByTestId('button-loading'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
