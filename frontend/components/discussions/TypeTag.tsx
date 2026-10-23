import type { DiscussionType } from '@/lib/strapi/schemas';

const LABELS: Record<DiscussionType, string> = { question: 'Question', discussion: 'Discussion' };

export function TypeTag({ type }: { type: DiscussionType }) {
  return <span className="inline-flex items-center rounded-full bg-fill px-2 py-px text-[11.5px] font-semibold text-ink-2">{LABELS[type]}</span>;
}