import { Button } from './Button'

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center animate-rise">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand/10 font-display text-3xl text-brand">
        !
      </div>
      <h3 className="text-xl font-bold text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
