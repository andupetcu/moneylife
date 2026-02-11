import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';
import { App } from '../App';
function renderWithProviders(ui) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(_jsx(QueryClientProvider, { client: queryClient, children: ui }));
}
describe('App', () => {
    it('renders sidebar with navigation', () => {
        renderWithProviders(_jsx(App, {}));
        expect(screen.getByText('MoneyLife Admin')).toBeTruthy();
        expect(screen.getByTestId('nav-users')).toBeTruthy();
        expect(screen.getByTestId('nav-games')).toBeTruthy();
        expect(screen.getByTestId('nav-partners')).toBeTruthy();
        expect(screen.getByTestId('nav-analytics')).toBeTruthy();
        expect(screen.getByTestId('nav-anti-cheat')).toBeTruthy();
        expect(screen.getByTestId('nav-health')).toBeTruthy();
    });
    it('defaults to users page', () => {
        renderWithProviders(_jsx(App, {}));
        expect(screen.getByText('Users')).toBeTruthy();
    });
    it('navigates to games page', () => {
        renderWithProviders(_jsx(App, {}));
        fireEvent.click(screen.getByTestId('nav-games'));
        expect(screen.getByText('Games')).toBeTruthy();
    });
    it('navigates to partners page', () => {
        renderWithProviders(_jsx(App, {}));
        fireEvent.click(screen.getByTestId('nav-partners'));
        expect(screen.getByText('Partners')).toBeTruthy();
    });
    it('navigates to analytics page', () => {
        renderWithProviders(_jsx(App, {}));
        fireEvent.click(screen.getByTestId('nav-analytics'));
        expect(screen.getByText('Analytics')).toBeTruthy();
    });
    it('navigates to anti-cheat page', () => {
        renderWithProviders(_jsx(App, {}));
        fireEvent.click(screen.getByTestId('nav-anti-cheat'));
        expect(screen.getByText('Anti-Cheat')).toBeTruthy();
    });
    it('navigates to health page', () => {
        renderWithProviders(_jsx(App, {}));
        fireEvent.click(screen.getByTestId('nav-health'));
        expect(screen.getByText('System Health')).toBeTruthy();
    });
    it('has main content area', () => {
        renderWithProviders(_jsx(App, {}));
        expect(screen.getByTestId('main-content')).toBeTruthy();
    });
});
