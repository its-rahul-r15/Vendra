import { Button } from './Button'

export function EmptyState({
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  icon: Icon,
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[#e7e5df] bg-white p-8 text-center my-8 shadow-sm">
      {Icon ? (
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#f4f2ec] text-[#121212]">
          <Icon className="size-6 text-[#121212]" />
        </div>
      ) : null}
      <h3 className="text-xl font-bold text-[#121212]">{title}</h3>
      <p className="mt-2 text-base text-[#737069] leading-relaxed">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
