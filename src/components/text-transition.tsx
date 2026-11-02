"use client";

type TextTag = "h1" | "h2" | "p" | "span";

type TextTransitionProps = {
  text: string;
  className?: string;
  as?: TextTag;
  delay?: number;
};

export function TextTransition({
  text,
  className,
  as: Tag = "span",
  delay = 0,
}: TextTransitionProps) {
  const words = text.trim().split(/\s+/);

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="fsh-text-mask">
            <span
              className="fsh-text-rise"
              style={{ animationDelay: `${delay + index * 0.06}s` }}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
