export function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={4}
        className="w-full rounded-md border px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
