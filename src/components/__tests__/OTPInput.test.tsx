import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { OTPInput } from '../OTPInput';

describe('OTPInput', () => {
  it('calls onComplete with the code when 6 digits are entered', async () => {
    const onChange = jest.fn();
    const onComplete = jest.fn();
    await render(<OTPInput value="" onChange={onChange} onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByTestId('otp-input'), '482913');
    expect(onChange).toHaveBeenCalledWith('482913');
    expect(onComplete).toHaveBeenCalledWith('482913');
  });

  it('does not call onComplete before 6 digits', async () => {
    const onComplete = jest.fn();
    await render(<OTPInput value="" onChange={jest.fn()} onComplete={onComplete} />);
    await fireEvent.changeText(screen.getByTestId('otp-input'), '482');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('strips non-numeric input', async () => {
    const onChange = jest.fn();
    await render(<OTPInput value="" onChange={onChange} />);
    await fireEvent.changeText(screen.getByTestId('otp-input'), '4a8b');
    expect(onChange).toHaveBeenCalledWith('48');
  });
});
