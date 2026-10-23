// Static class names: Tailwind only generates classes it can find literally in the source.
const COLORS = ['bg-av-1', 'bg-av-2', 'bg-av-3', 'bg-av-4', 'bg-av-5'] as const;
const SIZES = { sm: 'size-[30px] text-[11.5px]', md: 'size-10 text-sm' } as const;

/** Stable color per username, initials as content (no photo in scope). */
export function Avatar({ username, size = 'sm' }: { username: string | null; size?: keyof typeof SIZES }) {
  const name = username ?? '?';
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const initials = name.replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ${COLORS[hash % COLORS.length]} ${SIZES[size]}`}>
      {initials}
    </span>
  );
}
