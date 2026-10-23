/** Mockup's "tcount" box: dashed red when nobody has answered yet. */
export function ReplyCount({ count }: { count: number }) {
  const zero = count === 0;
  return (
    <div className={`flex h-[58px] w-[62px] flex-col items-center justify-center rounded-tile border leading-tight ${zero ? 'border-dashed border-alert text-alert' : 'border-line text-ink-2'}`}>
      <b className={`text-[19px] font-semibold tabular-nums ${zero ? 'text-alert' : 'text-ink'}`}>{count}</b>
      <span className="text-[10.5px]">{count > 1 ? 'réponses' : 'réponse'}</span>
    </div>
  );
}