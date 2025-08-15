import {
    WithContext,
    Organization,
    WebSite,
    BreadcrumbList,
    Article,
    FAQPage,
    SoftwareApplication,
    Person,
    ImageObject,
    WebPage,
    CollectionPage,
    ItemList,
    ListItem,
    Offer,
    Question,
    Answer,
    SearchAction,
    Thing,
} from "schema-dts";

/**
 * Generic JSON-LD component that renders structured data
 */
export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

/**
 * Organization JSON-LD component for site-wide organization information
 */
export function OrganizationJsonLd({
    name,
    url,
    logo,
    email,
    sameAs = [],
}: {
    name: string;
    url: string;
    logo: string;
    email?: string;
    sameAs?: string[];
}) {
    const data: WithContext<Organization> = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo,
        ...(email && { email }),
        ...(sameAs.length > 0 && { sameAs }),
    };

    return <JsonLd data={data} />;
}

/**
 * Website JSON-LD component for homepage and general website information
 */
export function WebsiteJsonLd({
    url,
    name,
    description,
    searchUrl,
    inLanguage,
}: {
    url: string;
    name: string;
    description?: string;
    searchUrl?: string;
    inLanguage?: string;
}) {
    const data: WithContext<WebSite> = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        ...(description && { description }),
        ...(searchUrl && {
            potentialAction: {
                "@type": "SearchAction",
                target: searchUrl,
                "query-input": "required name=search_term_string",
            } as SearchAction,
        }),
        ...(inLanguage && { inLanguage }),
    };

    return <JsonLd data={data} />;
}

/**
 * Article JSON-LD component for blog posts
 */
export function ArticleJsonLd({
    url,
    title,
    description,
    authorName,
    publisherName,
    publisherLogo,
    publishDate,
    modifiedDate,
    imageUrl,
    tags = [],
    categoryName,
    inLanguage = "en",
}: {
    url: string;
    title: string;
    description?: string;
    authorName?: string;
    publisherName: string;
    publisherLogo: string;
    publishDate?: string;
    modifiedDate?: string;
    imageUrl?: string;
    tags?: string[];
    categoryName?: string;
    inLanguage?: string;
}) {
    const data: WithContext<Article> = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        inLanguage,
        ...(description && { description }),
        ...(authorName && {
            author: {
                "@type": "Person",
                name: authorName,
            } as Person,
        }),
        publisher: {
            "@type": "Organization",
            name: publisherName,
            logo: {
                "@type": "ImageObject",
                url: publisherLogo,
            } as ImageObject,
        } as Organization,
        ...(publishDate && { datePublished: publishDate }),
        ...(modifiedDate && { dateModified: modifiedDate }),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
        } as WebPage,
        ...(imageUrl && {
            image: {
                "@type": "ImageObject",
                url: imageUrl,
            } as ImageObject,
        }),
        ...(tags.length > 0 && { keywords: tags.join(", ") }),
        ...(categoryName && { articleSection: categoryName }),
    };

    return <JsonLd data={data} />;
}

/**
 * FAQ JSON-LD component for FAQ sections
 */
export function FAQJsonLd({
    questions,
    inLanguage,
}: {
    inLanguage?: string;
    questions: Array<{
        question: string;
        answer: string;
    }>;
}) {
    const data: WithContext<FAQPage> = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage,
        mainEntity: questions.map(
            (item) =>
                ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: item.answer,
                    } as Answer,
                }) as Question,
        ),
    };

    return <JsonLd data={data} />;
}

/**
 * SoftwareApplication JSON-LD component for tools and applications
 */
export function SoftwareApplicationJsonLd({
    name,
    description,
    url,
    applicationCategory = "WebApplication",
    operatingSystem = "Web",
    keywords = [],
    offers = { price: "0", priceCurrency: "USD" },
    screenshot,
    inLanguage = "en",
}: {
    name: string;
    description: string;
    url: string;
    inLanguage?: string;
    applicationCategory?: string;
    operatingSystem?: string;
    keywords?: string[];
    offers?: {
        price: string;
        priceCurrency: string;
    };
    screenshot?: string;
}) {
    const data: WithContext<SoftwareApplication> = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        description,
        inLanguage,
        applicationCategory,
        operatingSystem,
        offers: {
            "@type": "Offer",
            price: offers.price,
            priceCurrency: offers.priceCurrency,
        } as Offer,
        ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
        url,
        ...(screenshot && {
            screenshot: {
                "@type": "ImageObject",
                url: screenshot,
            } as ImageObject,
        }),
    };

    return <JsonLd data={data} />;
}

/**
 * WebPage JSON-LD component for general web pages
 */
export function WebPageJsonLd({
    url,
    name,
    description,
    breadcrumb,
    datePublished,
    dateModified,
    image,
    inLanguage,
}: {
    url: string;
    name: string;
    inLanguage?: string;
    description?: string;
    breadcrumb?: Array<{
        name: string;
        item: string;
    }>;
    datePublished?: string;
    dateModified?: string;
    image?: string;
}) {
    const data: WithContext<WebPage> = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name,
        url,
        inLanguage,
        ...(description && { description }),
        ...(datePublished && { datePublished }),
        ...(dateModified && { dateModified }),
        ...(image && {
            image: {
                "@type": "ImageObject",
                url: image,
            } as ImageObject,
        }),
        ...(breadcrumb &&
            breadcrumb.length > 0 && {
                breadcrumb: {
                    "@type": "BreadcrumbList",
                    itemListElement: breadcrumb.map(
                        (item, index) =>
                            ({
                                "@type": "ListItem",
                                position: index + 1,
                                name: item.name,
                                item: item.item,
                            }) as ListItem,
                    ),
                } as BreadcrumbList,
            }),
    };

    return <JsonLd data={data} />;
}

/**
 * CollectionPage JSON-LD component for pages that list multiple items
 */
export function CollectionPageJsonLd({
    url,
    name,
    description,
    breadcrumb,
    datePublished,
    dateModified,
    image,
    inLanguage,
}: {
    url: string;
    name: string;
    inLanguage?: string;
    description?: string;
    breadcrumb?: Array<{
        name: string;
        item: string;
    }>;
    datePublished?: string;
    dateModified?: string;
    image?: string;
}) {
    const data: WithContext<CollectionPage> = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name,
        url,
        inLanguage,
        ...(description && { description }),
        ...(datePublished && { datePublished }),
        ...(dateModified && { dateModified }),
        ...(image && {
            image: {
                "@type": "ImageObject",
                url: image,
            } as ImageObject,
        }),
        ...(breadcrumb &&
            breadcrumb.length > 0 && {
                breadcrumb: {
                    "@type": "BreadcrumbList",
                    itemListElement: breadcrumb.map(
                        (item, index) =>
                            ({
                                "@type": "ListItem",
                                position: index + 1,
                                name: item.name,
                                item: item.item,
                            }) as ListItem,
                    ),
                } as BreadcrumbList,
            }),
    };

    return <JsonLd data={data} />;
}

/**
 * ItemList JSON-LD component for lists of items
 */
export function ItemListJsonLd({
    itemListElement,
}: {
    itemListElement: Array<{
        name: string;
        url: string;
        image?: string;
        description?: string;
        position: number;
    }>;
}) {
    const data: WithContext<ItemList> = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: itemListElement.map(
            (item) =>
                ({
                    "@type": "ListItem",
                    position: item.position,
                    item: {
                        "@type": "Thing",
                        name: item.name,
                        url: item.url,
                        ...(item.image && {
                            image: {
                                "@type": "ImageObject",
                                url: item.image,
                            } as ImageObject,
                        }),
                        ...(item.description && {
                            description: item.description,
                        }),
                    },
                }) as ListItem,
        ),
    };

    return <JsonLd data={data} />;
}
