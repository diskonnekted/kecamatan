"use client";

// Tombol submit dengan dialog konfirmasi — dipakai oleh Server Component
// (RSC tidak boleh meneruskan event handler, jadi dipisah ke Client Component)
export function ConfirmSubmitButton({
  confirmMessage,
  className,
  title,
  children,
}: {
  confirmMessage: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      title={title}
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
