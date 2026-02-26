type SpecRowProps = {
  label: string;
  value: string | number | null | undefined;
};

export function SpecRow({ label, value }: SpecRowProps) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{String(value)}</span>
    </div>
  );
}
