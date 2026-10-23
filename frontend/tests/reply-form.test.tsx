import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReplyForm } from '@/components/discussions/ReplyForm';

describe('ReplyForm', () => {
  it('keeps the text and shows the field error when the server rejects the reply', async () => {
    const action = vi.fn().mockResolvedValue({ status: 'error', fieldError: 'Votre réponse est trop courte.' });
    render(<ReplyForm action={action} username="Camille_B" />);
    const textarea = screen.getByLabelText('Votre réponse');

    await userEvent.type(textarea, 'a');
    await userEvent.click(screen.getByRole('button', { name: 'Publier ma réponse' }));

    expect(await screen.findByText('Votre réponse est trop courte.')).toBeInTheDocument();
    expect(textarea).toHaveValue('a');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the text and confirms after a successful reply', async () => {
    const action = vi.fn().mockResolvedValue({ status: 'success', message: 'Votre réponse est publiée.' });
    render(<ReplyForm action={action} username="Camille_B" />);
    const textarea = screen.getByLabelText('Votre réponse');

    await userEvent.type(textarea, 'Merci pour vos conseils');
    await userEvent.click(screen.getByRole('button', { name: 'Publier ma réponse' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Votre réponse est publiée.');
    expect(textarea).toHaveValue('');
    expect(action.mock.calls[0]?.[1]).toBeInstanceOf(FormData);
  });
});
