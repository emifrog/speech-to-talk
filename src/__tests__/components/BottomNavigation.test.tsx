import { render, screen } from '@testing-library/react';
import { BottomNavigation } from '@/components/features/BottomNavigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('BottomNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/translate');
  });

  it('renders all navigation items', () => {
    render(<BottomNavigation />);

    expect(screen.getByText('Traduire')).toBeInTheDocument();
    expect(screen.getByText('Conversation')).toBeInTheDocument();
    expect(screen.getByText('Scanner')).toBeInTheDocument();
    expect(screen.getByText('Urgence')).toBeInTheDocument();
  });

  it('renders correct links', () => {
    render(<BottomNavigation />);

    expect(screen.getByRole('menuitem', { name: /traduire/i })).toHaveAttribute('href', '/translate');
    expect(screen.getByRole('menuitem', { name: /conversation/i })).toHaveAttribute('href', '/conversation');
    expect(screen.getByRole('menuitem', { name: /scanner/i })).toHaveAttribute('href', '/scan');
    expect(screen.getByRole('menuitem', { name: /urgence/i })).toHaveAttribute('href', '/emergency');
  });

  it('highlights active translate link', () => {
    mockUsePathname.mockReturnValue('/translate');
    render(<BottomNavigation />);

    const translateLink = screen.getByRole('menuitem', { name: /traduire/i });
    expect(translateLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights active conversation link', () => {
    mockUsePathname.mockReturnValue('/conversation');
    render(<BottomNavigation />);

    const conversationLink = screen.getByRole('menuitem', { name: /conversation/i });
    expect(conversationLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights active scan link', () => {
    mockUsePathname.mockReturnValue('/scan');
    render(<BottomNavigation />);

    const scanLink = screen.getByRole('menuitem', { name: /scanner/i });
    expect(scanLink).toHaveAttribute('aria-current', 'page');
  });

  it('highlights emergency link with accent color', () => {
    mockUsePathname.mockReturnValue('/emergency');
    render(<BottomNavigation />);

    const emergencyLink = screen.getByRole('menuitem', { name: /urgence/i });
    expect(emergencyLink).toHaveAttribute('aria-current', 'page');
  });

  it('treats root path as translate', () => {
    mockUsePathname.mockReturnValue('/');
    render(<BottomNavigation />);

    const translateLink = screen.getByRole('menuitem', { name: /traduire/i });
    expect(translateLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders navigation element', () => {
    render(<BottomNavigation />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('has fixed position classes', () => {
    render(<BottomNavigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed', 'bottom-0');
  });
});
