export function HonestLabel({ className = "" }: { className?: string }) {
  return (
    <p
      className={`border-l-2 border-champagne pl-3 text-[11px] leading-relaxed text-stone ${className}`}
    >
      Visual preview only — powered by YouCam Apparel VTO. Not a guarantee of fit,
      size, or colour accuracy.
    </p>
  );
}
