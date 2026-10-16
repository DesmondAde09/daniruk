import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { TextField } from '../TextField';

describe('TextField', () => {
  it('calls onChangeText while typing', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField label="Email address" placeholder="you@example.com" onChangeText={onChangeText} />,
    );
    await fireEvent.changeText(screen.getByTestId('textfield-input'), 'adebayo@daniruk.app');
    expect(onChangeText).toHaveBeenCalledWith('adebayo@daniruk.app');
  });

  it('secure toggle switches secureTextEntry', async () => {
    await render(<TextField label="Password" secure />);
    expect(screen.getByTestId('textfield-input').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByLabelText('Show password'));
    expect(screen.getByTestId('textfield-input').props.secureTextEntry).toBe(false);
    await fireEvent.press(screen.getByLabelText('Hide password'));
    expect(screen.getByTestId('textfield-input').props.secureTextEntry).toBe(true);
  });

  it('renders the error message', async () => {
    await render(<TextField label="Email address" error="Enter a valid email address" />);
    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
  });

  it('is not editable when disabled', async () => {
    await render(<TextField label="Email address" disabled />);
    expect(screen.getByTestId('textfield-input').props.editable).toBe(false);
  });
});
