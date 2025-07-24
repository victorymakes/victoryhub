import type { MDXComponents } from "mdx/types";
import Image from "next/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Basic HTML elements with Tailwind styling
        h1: ({ children }) => (
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4 mt-8">
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3 mt-6">
                {children}
            </h3>
        ),
        h4: ({ children }) => (
            <h4 className="text-lg font-semibold tracking-tight text-foreground mb-2 mt-4">
                {children}
            </h4>
        ),
        p: ({ children }) => (
            <p className="text-muted-foreground leading-7 mb-4">{children}</p>
        ),
        ul: ({ children }) => (
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-2">
                {children}
            </ol>
        ),
        li: ({ children }) => <li className="leading-7">{children}</li>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                {children}
            </blockquote>
        ),
        code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
            </code>
        ),
        pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">
                {children}
            </pre>
        ),
        a: ({ href, children }) => (
            <a
                href={href}
                className="text-primary hover:text-primary/80 underline underline-offset-4"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                    href?.startsWith("http") ? "noopener noreferrer" : undefined
                }
            >
                {children}
            </a>
        ),
        strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
                {children}
            </strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="border-border my-8" />,
        table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
                <table className="min-w-full border-collapse border border-border">
                    {children}
                </table>
            </div>
        ),
        th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
        ),
        img: ({ src, alt, ...props }) => (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image
                    fill
                    src={src}
                    alt={alt}
                    className="object-cover"
                    {...props}
                />
            </div>
        ),
        ...components,
    };
}
