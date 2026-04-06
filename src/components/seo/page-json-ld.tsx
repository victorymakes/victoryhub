import { config } from "@/lib/config";
import {
  ArticleJsonLd,
  CollectionPageJsonLd,
  FAQJsonLd,
  ItemListJsonLd,
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebPageJsonLd,
  WebsiteJsonLd,
} from "./json-ld";

type BreadcrumbItem = {
  name: string;
  item: string;
};

/**
 * Root JSON-LD component for the homepage
 */
export function RootJsonLd({
  description = "Discover free and powerful utilities for developers, designers, and professionals.",
  inLanguage = "en",
}: {
  description: string;
  inLanguage: string;
}) {
  return (
    <>
      <WebsiteJsonLd
        name={config.siteName}
        url={config.baseUrl}
        description={description}
        inLanguage={inLanguage}
      />
      <OrganizationJsonLd
        name={config.siteName}
        url={config.baseUrl}
        logo={`${config.baseUrl}/favicon.png`}
        email={config.contact.email}
        sameAs={[config.contact.twitter.url]}
      />
    </>
  );
}

/**
 * Blog Post JSON-LD component for individual blog articles
 */
export function BlogPostJsonLd({
  url,
  title,
  description,
  authorName,
  publishDate,
  modifiedDate,
  imageUrl,
  tags = [],
  categoryName,
  breadcrumbItems,
  inLanguage,
}: {
  url: string;
  title: string;
  description?: string;
  authorName?: string;
  publishDate?: string;
  modifiedDate?: string;
  imageUrl?: string;
  tags?: string[];
  categoryName?: string;
  breadcrumbItems: BreadcrumbItem[];
  inLanguage?: string;
}) {
  return (
    <>
      <ArticleJsonLd
        url={url}
        title={title}
        description={description}
        authorName={authorName}
        publisherName={config.siteName}
        publisherLogo={`${config.baseUrl}/favicon.png`}
        publishDate={publishDate}
        modifiedDate={modifiedDate || publishDate}
        imageUrl={imageUrl}
        tags={tags}
        categoryName={categoryName}
        inLanguage={inLanguage}
      />
      <WebPageJsonLd
        url={url}
        name={title}
        description={description}
        breadcrumb={breadcrumbItems}
        datePublished={publishDate}
        dateModified={modifiedDate}
        image={imageUrl}
        inLanguage={inLanguage}
      />
    </>
  );
}

/**
 * Blog Category JSON-LD component for blog category pages
 */
export function BlogCategoryJsonLd({
  url,
  title,
  description,
  breadcrumbItems,
  blogItems,
  inLanguage = "en",
}: {
  url: string;
  title: string;
  description?: string;
  breadcrumbItems: BreadcrumbItem[];
  blogItems: Array<{
    name: string;
    url: string;
    image?: string;
    description?: string;
    position: number;
  }>;
  inLanguage?: string;
}) {
  return (
    <>
      <CollectionPageJsonLd
        url={url}
        name={title}
        description={description}
        breadcrumb={breadcrumbItems}
        inLanguage={inLanguage}
      />
      <ItemListJsonLd itemListElement={blogItems} />
    </>
  );
}

/**
 * Tool Collection JSON-LD component for tool listing pages
 */
export function ToolCollectionJsonLd({
  url,
  title,
  description,
  breadcrumbItems,
  toolItems,
  inLanguage = "en",
}: {
  url: string;
  title: string;
  description?: string;
  breadcrumbItems: BreadcrumbItem[];
  toolItems: Array<{
    name: string;
    url: string;
    image?: string;
    description: string;
    position: number;
  }>;
  inLanguage?: string;
}) {
  return (
    <>
      <CollectionPageJsonLd
        url={url}
        name={title}
        description={description}
        breadcrumb={breadcrumbItems}
        inLanguage={inLanguage}
      />
      <ItemListJsonLd itemListElement={toolItems} />
    </>
  );
}

/**
 * Tool Detail JSON-LD component for individual tool pages
 */
export function ToolDetailJsonLd({
  name,
  description,
  url,
  applicationCategory,
  operatingSystem,
  keywords,
  offers,
  screenshot,
  breadcrumbItems,
  faqItems,
  inLanguage = "en",
}: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  keywords?: string[];
  offers?: {
    price: string;
    priceCurrency: string;
  };
  screenshot?: string;
  breadcrumbItems: BreadcrumbItem[];
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  inLanguage?: string;
}) {
  return (
    <>
      <SoftwareApplicationJsonLd
        name={name}
        description={description}
        url={url}
        applicationCategory={applicationCategory}
        operatingSystem={operatingSystem}
        keywords={keywords}
        offers={offers}
        screenshot={screenshot}
        inLanguage={inLanguage}
      />
      <WebPageJsonLd
        url={url}
        name={name}
        description={description}
        breadcrumb={breadcrumbItems}
        image={screenshot}
        inLanguage={inLanguage}
      />
      {faqItems && faqItems.length > 0 && (
        <FAQJsonLd questions={faqItems} inLanguage={inLanguage} />
      )}
    </>
  );
}

/**
 * Generic Page JSON-LD component for standard pages
 */
export function PageJsonLd({
  url,
  title,
  description,
  breadcrumbItems,
  datePublished,
  dateModified,
  image,
  inLanguage = "en",
}: {
  url: string;
  title: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  datePublished?: string;
  dateModified?: string;
  image?: string;
  inLanguage?: string;
}) {
  return (
    <WebPageJsonLd
      url={url}
      name={title}
      description={description}
      breadcrumb={breadcrumbItems}
      datePublished={datePublished}
      dateModified={dateModified}
      image={image}
      inLanguage={inLanguage}
    />
  );
}
