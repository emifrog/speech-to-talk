import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MicrophoneButton } from '@/components/features/MicrophoneButton';

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  lightHaptic: jest.fn(),
  mediumHaptic: jest.fn(),
  heavyHaptic: jest.fn(),
}));

describe('MicrophoneButton', () => {
  const defaultProps = {
    audioState: 'idle' as const,
    duration: 0,
    onPress: jest.fn(),
    onRelease: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in idle state', () => {
    render(<MicrophoneButton {...defaultProps} />);

    expect(screen.getByText(/maintenez pour parler/i)).toBeInTheDocument();
  });

  it('renders in recording state', () => {
    render(<MicrophoneButton {...defaultProps} audioState="recording" duration={5} />);

    expect(screen.getByText(/0:05/)).toBeInTheDocument();
    expect(screen.getByText(/relâchez pour traduire/i)).toBeInTheDocument();
  });

  it('renders in processing state', () => {
    render(<MicrophoneButton {...defaultProps} audioState="processing" />);

    expect(screen.getByText(/traduction en cours/i)).toBeInTheDocument();
  });

  it('renders in playing state', () => {
    render(<MicrophoneButton {...defaultProps} audioState="playing" />);

    expect(screen.getByText(/lecture audio/i)).toBeInTheDocument();
  });

  it('renders in error state', () => {
    render(<MicrophoneButton {...defaultProps} audioState="error" />);

    expect(screen.getByText(/erreur/i)).toBeInTheDocument();
  });

  it('calls onPress on mouse down', async () => {
    const onPress = jest.fn();
    render(<MicrophoneButton {...defaultProps} onPress={onPress} />);

    const button = screen.getByRole('button');
    fireEvent.mouseDown(button);

    expect(onPress).toHaveBeenCalled();
  });

  it('calls onRelease on mouse up', async () => {
    const onRelease = jest.fn();
    render(<MicrophoneButton {...defaultProps} onRelease={onRelease} />);

    const button = screen.getByRole('button');
    fireEvent.mouseUp(button);

    expect(onRelease).toHaveBeenCalled();
  });

  it('calls onRelease on mouse leave when recording', async () => {
    const onRelease = jest.fn();
    render(
      <MicrophoneButton
        {...defaultProps}
        audioState="recording"
        onRelease={onRelease}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.mouseLeave(button);

    expect(onRelease).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<MicrophoneButton {...defaultProps} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled during processing', () => {
    render(<MicrophoneButton {...defaultProps} audioState="processing" />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('formats duration correctly', () => {
    render(<MicrophoneButton {...defaultProps} audioState="recording" duration={65} />);

    expect(screen.getByText(/1:05/)).toBeInTheDocument();
  });

  it('supports touch events', async () => {
    const onPress = jest.fn();
    const onRelease = jest.fn();
    render(
      <MicrophoneButton {...defaultProps} onPress={onPress} onRelease={onRelease} />
    );

    const button = screen.getByRole('button');

    fireEvent.touchStart(button);
    expect(onPress).toHaveBeenCalled();

    fireEvent.touchEnd(button);
    expect(onRelease).toHaveBeenCalled();
  });

  it('has correct accessibility label based on state', () => {
    const { rerender } = render(<MicrophoneButton {...defaultProps} />);

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('parler'));

    rerender(<MicrophoneButton {...defaultProps} audioState="recording" />);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('arrêter'));
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<MicrophoneButton {...defaultProps} size="sm" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<MicrophoneButton {...defaultProps} size="lg" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
