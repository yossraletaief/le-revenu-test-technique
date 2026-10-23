import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatRelative } from '@/lib/format';

interface Props { username: string | null; createdAt: string; size?: 'sm' | 'md'; now?: Date }

export function Byline({ username, createdAt, size = 'sm', now }: Props) {
  return (
    <div className="flex items-center gap-[11px]">
      <Avatar username={username} size={size} />
      <div>
        <p className="font-semibold">{username ?? 'Membre supprimé'}</p>
        <p className="text-[12.5px] text-ink-3">
          <time dateTime={createdAt} title={formatDate(createdAt)}>{formatRelative(createdAt, now)}</time>
        </p>
      </div>
    </div>
  );
}
