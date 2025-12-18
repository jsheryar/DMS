import { ShieldCheck } from 'lucide-react';

export default function Logo({ className }: { className?: string }) {
  return (
    <ShieldCheck className={`h-8 w-8 text-primary ${className}`} />
  );
}
