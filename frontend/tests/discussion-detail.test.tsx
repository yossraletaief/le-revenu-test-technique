import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DiscussionArticle } from '@/components/discussions/DiscussionArticle';
import { ReplyList } from '@/components/discussions/ReplyList';
import { discussionDetailResponseSchema, type DiscussionDetail } from '@/lib/strapi/schemas';

const now = new Date('2026-10-23T12:00:00Z');
const discussion: DiscussionDetail = {
  documentId: 'd1', title: 'Ouvrir un PEA avec 5 000 € : par où commencer ?', slug: 'ouvrir-un-pea', type: 'question',
  content: "Premier paragraphe.\n\nSecond paragraphe <img src=x onerror=alert(1)>",
  createdAt: '2026-10-21T12:00:00Z', lastActivityAt: '2026-10-22T12:00:00Z',
  author: { username: 'Thomas_PEA' }, category: { name: 'Bourse & actions', slug: 'bourse', description: null },
  replyCount: 2,
  replies: [
    { documentId: 'r1', content: 'Un ETF monde.', createdAt: '2026-10-22T09:00:00Z', author: { username: 'Vincent_ETF' } },
    { documentId: 'r2', content: 'Merci !', createdAt: '2026-10-22T12:00:00Z', author: null },
  ],
};

describe('DiscussionArticle', () => {
  it('shows title, category, author, date and content', () => {
    render(<DiscussionArticle discussion={discussion} now={now} />);
    expect(screen.getByRole('heading', { level: 1, name: discussion.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bourse & actions' })).toHaveAttribute('href', '/?category=bourse');
    expect(screen.getByText('Thomas_PEA')).toBeInTheDocument();
    expect(screen.getByText('avant-hier')).toBeInTheDocument();
    expect(screen.getByText('Premier paragraphe.')).toBeInTheDocument();
  });

  it('renders user HTML as plain text, never as markup', () => {
    const { container } = render(<DiscussionArticle discussion={discussion} now={now} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText(/<img src=x onerror=alert\(1\)>/)).toBeInTheDocument();
  });
});

describe('ReplyList', () => {
  it('lists replies in the order given by the API, with a count heading', () => {
    render(<ReplyList replies={discussion.replies} now={now} />);
    expect(screen.getByRole('heading', { name: '2 réponses' })).toBeInTheDocument();
    const [first, second] = screen.getAllByRole('article');
    expect(within(first!).getByText('Vincent_ETF')).toBeInTheDocument();
    expect(within(second!).getByText('Membre supprimé')).toBeInTheDocument();
  });

  it('shows an empty state when there is no reply', () => {
    render(<ReplyList replies={[]} />);
    expect(screen.getByRole('heading', { name: "Aucune réponse pour l'instant" })).toBeInTheDocument();
  });
});

describe('discussionDetailResponseSchema', () => {
  it('accepts the API shape and rejects a missing replies array', () => {
    expect(discussionDetailResponseSchema.safeParse({ data: discussion }).success).toBe(true);
    const { replies: _omit, ...withoutReplies } = discussion;
    expect(discussionDetailResponseSchema.safeParse({ data: withoutReplies }).success).toBe(false);
  });
});
