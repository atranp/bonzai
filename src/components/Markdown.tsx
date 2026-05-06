import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentProps } from "react";

type MarkdownProps = Omit<ComponentProps<typeof ReactMarkdown>, "children"> & {
  children: string | null | undefined;
  className?: string;
};

export function Markdown({ className, ...props }: MarkdownProps) {
  const wrap =
    [
      "space-y-3 text-[0.9375rem] leading-[1.65] text-ink/65",
      "[&_p]:leading-[1.65]",
      "[&_a]:text-ink/80 no-underline decoration-0 border-b border-ink/15 transition-colors hover:border-ink/35 hover:text-ink",
      "[&_ul]:list-disc [&_ul]:pl-5",
      "[&_ol]:list-decimal [&_ol]:pl-5",
      "[&_li]:my-1",
      "[&_strong]:text-ink",
      "[&_code]:rounded-md [&_code]:bg-ink/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
      "[&_blockquote]:border-l-2 [&_blockquote]:border-ink/15 [&_blockquote]:pl-4 [&_blockquote]:text-ink/60",
      className ?? "",
    ].join(" ") || undefined;

  return (
    <div className={wrap}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} {...props} />
    </div>
  );
}

