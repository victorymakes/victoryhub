import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    faqItems: FAQItem[];
}

export function FAQSection({ faqItems }: FAQSectionProps) {
    if (!faqItems || faqItems.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div
                                    className="text-muted-foreground leading-relaxed [&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-2 hover:[&_a]:text-blue-800 dark:[&_a]:text-blue-400 dark:hover:[&_a]:text-blue-300 [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: item.answer,
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
