import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiscussionList } from '@/components/discussions/DiscussionList';
import type { DiscussionListItem } from '@/lib/strapi/schemas';

const now = new Date('2026-10-23T12:00:00Z');
const items: DiscussionListItem[] = [
  {
    documentId: 'a1', title: 'Ouvrir un PEA avec 5 000 € : par où commencer ?', slug: 'ouvrir-un-pea',
    type: 'question', excerpt: "Je viens d'ouvrir un PEA…", createdAt: '2026-10-23T09:00:00Z',
    author: { username: 'Thomas_PEA' }, category: { name: 'Bourse & actions', slug: 'bourse' }, replyCount: 2,
  },
  {
    documentId: 'b2', title: 'Location meublée : micro-BIC ou régime réel ?', slug: 'location-meublee',
    type: 'discussion', excerpt: 'Je loue un studio meublé…', createdAt: '2026-10-22T10:00:00Z',
    author: null, category: null, replyCount: 0,
  },
];

describe('DiscussionList', () => {
  it('renders title, author, category, reply count and date for each discussion', () => {
    render(<DiscussionList discussions={items} now={now} />);
    const [first] = screen.getAllByRole('article');
    if (!first) throw new Error('no article rendered');
    const card = within(first);

    expect(card.getByRole('link', { name: items[0]!.title })).toHaveAttribute('href', '/discussions/ouvrir-un-pea');
    expect(card.getByRole('link', { name: 'Bourse & actions' })).toHaveAttribute('href', '/?category=bourse');
    expect(card.getByText('Thomas_PEA')).toBeInTheDocument();
    expect(card.getAllByText(/2 réponses/).length).toBeGreaterThan(0);
    expect(card.getByText('il y a 3 heures')).toHaveAttribute('datetime', '2026-10-23T09:00:00Z');
  });

  it('handles a deleted author, no category and zero replies', () => {
    render(<DiscussionList discussions={items} now={now} />);
    const second = screen.getAllByRole('article')[1];
    if (!second) throw new Error('second article missing');
    const card = within(second);
    expect(card.getByText('Membre supprimé')).toBeInTheDocument();
    expect(card.getAllByText(/0 réponse/).length).toBeGreaterThan(0);
    expect(card.getByText('hier')).toBeInTheDocument();
  });

  it('shows an empty state when there is no discussion', () => {
    render(<DiscussionList discussions={[]} />);
    expect(screen.getByRole('heading', { name: "Rien ici pour l'instant" })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
