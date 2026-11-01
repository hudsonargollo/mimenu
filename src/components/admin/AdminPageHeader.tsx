import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  /** Two-digit index shown in the eyebrow, e.g. "02". */
  index: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}

/**
 * Editorial section header: numbered eyebrow, serif title, hairline rule.
 * Every admin screen opens with one so the shell reads as a single publication.
 */
const AdminPageHeader = ({ index, eyebrow, title, description, actions, meta }: AdminPageHeaderProps) => (
  <header className="mb-8 border-b border-border pb-6">
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="noir-num text-[10px] font-bold tracking-[0.18em] text-primary">{index}</span>
          <span className="h-px w-8 bg-border" aria-hidden="true" />
          <span className="noir-eyebrow">{eyebrow}</span>
        </div>
        <h1 className="mt-3 font-display text-[2rem] leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[2.6rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">{meta}</div>}
      </div>

      {actions && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 [&>*]:flex-1 [&>*]:justify-center md:w-auto md:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </div>
  </header>
);

export default AdminPageHeader;
