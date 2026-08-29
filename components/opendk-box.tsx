import type { ReactNode } from "react";

/**
 * Box widget ala AdminLTE/OpenDK:
 * - Header bg-blue (atau accent) dengan title text-bold
 * - Body putih dengan padding konsisten
 * Pattern dikonversi ke Tailwind v4 + design system kita.
 */
export function OpenDKBox({
  title,
  icon,
  children,
  className = "",
  bodyClassName = "",
  variant = "default", // 'default' | 'solid-blue' | 'flat'
}: {
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: "default" | "solid-blue" | "flat";
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-white shadow-sm overflow-hidden ${className}`}
    >
      {title && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-center font-bold text-white ${
            variant === "flat"
              ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
              : "bg-[var(--color-primary)]"
          } !bg-[var(--color-primary)]`}
        >
          {icon && <span className="text-base">{icon}</span>}
          <h3 className="text-sm font-bold uppercase tracking-wide !text-white text-white">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/** Sub-widget di dalam box: box-header dengan ikon + judul + body */
export function OpenDKSubBox({
  title,
  icon,
  titleClassName = "text-[var(--color-primary)]",
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  titleClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
        {icon && (
          <span className={`text-base ${titleClassName}`}>{icon}</span>
        )}
        <h4 className={`text-sm font-bold ${titleClassName}`}>{title}</h4>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
