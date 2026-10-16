import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { SegmentedToggle } from '../SegmentedToggle';

const options = [
  { value: 'login' as const, label: 'Log in' },
  { value: 'signup' as const, label: 'Sign up' },
];

describe('SegmentedToggle', () => {
  it('calls onChange when the inactive option is pressed', async () => {
    const onChange = jest.fn();
    await render(<SegmentedToggle options={options} value="login" onChange={onChange} />);
    await fireEvent.press(screen.getByText('Sign up'));
    expect(onChange).toHaveBeenCalledWith('signup');
  });

  it('marks the active option as selected', async () => {
    await render(<SegmentedToggle options={options} value="signup" onChange={jest.fn()} />);
    expect(screen.getByTestId('segment-signup').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('segment-login').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });
});
