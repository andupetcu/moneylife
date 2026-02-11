import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { MLDialog } from '../src/components/MLDialog';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

describe('MLDialog', () => {
  it('renders title and message when visible', () => {
    const { getByText } = render(wrap(
      <MLDialog
        visible
        titleKey="auth.logOut"
        messageKey="auth.logOutConfirm"
        onConfirm={() => {}}
      />
    ));
    expect(getByText('Log out')).toBeTruthy();
    expect(getByText('Are you sure you want to log out?')).toBeTruthy();
  });

  it('calls onConfirm when confirm is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(wrap(
      <MLDialog
        visible
        titleKey="auth.logOut"
        messageKey="auth.logOutConfirm"
        onConfirm={onConfirm}
      />
    ));
    fireEvent.press(getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(wrap(
      <MLDialog
        visible
        titleKey="auth.logOut"
        messageKey="auth.logOutConfirm"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    ));
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders danger variant', () => {
    const { getByText } = render(wrap(
      <MLDialog
        visible
        titleKey="profile.deleteAccount"
        messageKey="profile.deleteAccountConfirm"
        onConfirm={() => {}}
        variant="danger"
      />
    ));
    expect(getByText('Delete account')).toBeTruthy();
  });

  it('renders custom confirm/cancel keys', () => {
    const { getByText } = render(wrap(
      <MLDialog
        visible
        titleKey="auth.logOut"
        messageKey="auth.logOutConfirm"
        confirmKey="common.yes"
        cancelKey="common.no"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ));
    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });
});
