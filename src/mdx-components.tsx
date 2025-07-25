import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { config } from "@/lib/config";

const ContactEmail = () => (
    <a
        href={`mailto:${config.contact.email}`}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
    >
        {config.contact.email}
    </a>
);

const ContactTwitter = () => (
    <a
        href={config.contact.twitter.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium"
    >
        {config.contact.twitter.handle}
    </a>
);

export const mdxComponents: MDXComponents = {
    h1: ({ children }) => (
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-8 mb-4">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-6 mb-3">
            {children}
        </h3>
    ),
    p: ({ children }) => (
        <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="text-gray-700 dark:text-gray-300">{children}</li>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-gray-900 dark:text-gray-100">
            {children}
        </strong>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
            {children}
        </a>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 mb-4">
            {children}
        </blockquote>
    ),
    code: ({ children }) => (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm">
            {children}
        </code>
    ),
    pre: ({ children }) => (
        <pre className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            {children}
        </pre>
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
    ContactEmail,
    ContactTwitter,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...mdxComponents,
        ...components,
    };
}
