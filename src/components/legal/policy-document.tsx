import type { PolicyBlock } from "@/lib/legal/policies";

export function PolicyDocument({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="mt-8 divide-y divide-hairline border-y border-hairline">
      {blocks.map((block) => (
        <section key={block.heading} className="py-6">
          <h2 className="font-display text-2xl text-noir">{block.heading}</h2>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-relaxed text-stone">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
