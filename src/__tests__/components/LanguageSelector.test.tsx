import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '@/components/features/LanguageSelector';
import { useLanguages } from '@/lib/store';

// Mock the store
jest.mock('@/lib/store', () => ({
  useLanguages: jest.fn(),
}));

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  lightHaptic: jest.fn(),
}));

const mockUseLanguages = useLanguages as jest.MockedFunction<typeof useLanguages>;

describe('LanguageSelector', () => {
  const defaultMock = {
    sourceLang: 'fr' as const,
    targetLang: 'en' as const,
    setSourceLang: jest.fn(),
    setTargetLang: jest.fn(),
    swapLanguages: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguages.mockReturnValue(defaultMock);
  });

  it('renders source and target language buttons', () => {
    render(<LanguageSelector />);

    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('displays correct labels for source and target', () => {
    render(<LanguageSelector />);

    expect(screen.getByText('De')).toBeInTheDocument();
    expect(screen.getByText('Vers')).toBeInTheDocument();
  });

  it('opens source dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const sourceButton = screen.getByRole('button', { name: /langue source/i });
    await user.click(sourceButton);

    // Dropdown should show all languages
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('calls setSourceLang when selecting a new source language', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const sourceButton = screen.getByRole('button', { name: /langue source/i });
    await user.click(sourceButton);

    // Find and click German option
    const germanOption = screen.getByRole('option', { name: /deutsch/i });
    await user.click(germanOption);

    expect(defaultMock.setSourceLang).toHaveBeenCalledWith('de');
  });

  it('calls swapLanguages when swap button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const swapButton = screen.getByRole('button', { name: /inverser/i });
    await user.click(swapButton);

    expect(defaultMock.swapLanguages).toHaveBeenCalled();
  });

  it('swaps languages when selecting target language same as source', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const targetButton = screen.getByRole('button', { name: /langue cible/i });
    await user.click(targetButton);

    // Select French (same as source)
    const frenchOption = screen.getByRole('option', { name: /français/i });
    await user.click(frenchOption);

    expect(defaultMock.swapLanguages).toHaveBeenCalled();
  });

  it('closes dropdown on escape key', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const sourceButton = screen.getByRole('button', { name: /langue source/i });
    await user.click(sourceButton);

    // Dropdown should be open
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);

    // Press escape
    await user.keyboard('{Escape}');

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const sourceButton = screen.getByRole('button', { name: /langue source/i });
    await user.click(sourceButton);

    // Navigate down
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(defaultMock.setSourceLang).toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(<LanguageSelector />);

    const sourceButton = screen.getByRole('button', { name: /langue source/i });
    const targetButton = screen.getByRole('button', { name: /langue cible/i });

    expect(sourceButton).toHaveAttribute('aria-haspopup', 'listbox');
    expect(targetButton).toHaveAttribute('aria-haspopup', 'listbox');
  });
});
