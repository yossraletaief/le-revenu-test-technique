import type { DiscussionListItem } from '@/lib/strapi/schemas';
import { DiscussionCard } from './DiscussionCard';

import { EmptyState } from '../ui/EmptyState';
interface Props { discussions: DiscussionListItem[]; now?: Date }

export function DiscussionList({ discussions, now }: Props) {
  if (discussions.length === 0) {
    return <EmptyState title="Rien ici pour l'instant" text="Aucune discussion n'a encore été lancée dans cet espace." />;
  }
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
      {discussions.map((d) => <DiscussionCard key={d.documentId} discussion={d} now={now} />)}
    </div>
  );
}