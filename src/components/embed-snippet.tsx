"use client";

import { useEffect, useMemo, useState } from "react";

type EmbedSnippetProps = {
  storeId: string;
};

export function EmbedSnippet({ storeId }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [base, setBase] = useState(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "",
  );

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const local = /localhost|127\.0\.0\.1/.test(env);
    setBase(!env || local ? window.location.origin : env);
  }, []);

  const snippet = useMemo(
    () => `<!-- FSH virtual fitting room -->
<script
  src="${base}/embed.js"
  data-store="${storeId}"
  data-base="${base}"
></script>`,
    [base, storeId],
  );

  return (
    <div className="overflow-hidden border border-hairline bg-noir text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Embed code
        </span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-champagne hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-white/80">{snippet}</pre>
    </div>
  );
}
