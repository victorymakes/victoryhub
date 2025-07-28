import { Menu } from "lucide-react";
import Container from "@/components/common/container";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { getCategories } from "@/service/tool-service";
import { DynamicIcon } from "@/components/common/dynamic-icon";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}

interface NavbarProps {
    logo?: {
        url: string;
        src: string;
        alt: string;
        title: string;
    };
    menu?: MenuItem[];
    auth?: {
        login: {
            title: string;
            url: string;
        };
        signup: {
            title: string;
            url: string;
        };
    };
}

const websiteName = "VictoryHub";

export const Navbar = async ({}: NavbarProps) => {
    const t = await getTranslations("Navigation");
    const locale = await getLocale();
    const toolItems: MenuItem[] = (await getCategories(locale)).map((item) => {
        return {
            title: item.name,
            url: `${item.slug === "all" ? `/tools` : `/tools#${item.slug}`}`,
            description: item.description,
            icon: item.icon ? <DynamicIcon name={item.icon} /> : undefined,
        };
    });

    const menu = [
        { title: t("home"), url: "/" },
        {
            title: t("tools"),
            url: "/tools",
            items: toolItems,
        },
        { title: t("blog"), url: "/blog" },
    ];

    return (
        <section className="py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container>
                {/* Desktop Menu */}
                <nav className="hidden justify-between lg:flex items-center">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href={"/"} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">
                                    V
                                </span>
                            </div>
                            <span className="text-xl font-bold text-foreground tracking-tight">
                                {websiteName}
                            </span>
                        </Link>
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                {menu.map((item) => renderMenuItem(item))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Language and Theme toggles */}
                        <ThemeToggle />
                        <LanguageToggle />

                        {/* Auth buttons */}
                        {/*<div className="flex gap-2 ml-2">*/}
                        {/*  <Button asChild variant="outline">*/}
                        {/*    <a href={auth.login.url}>{auth.login.title}</a>*/}
                        {/*  </Button>*/}
                        {/*  <Button asChild>*/}
                        {/*    <a href={auth.signup.url}>{auth.signup.title}</a>*/}
                        {/*  </Button>*/}
                        {/*</div>*/}
                    </div>
                </nav>

                {/* Mobile Menu */}
                <div className="block lg:hidden">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href={"/"} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">
                                    V
                                </span>
                            </div>
                            <span className="text-lg font-bold text-foreground">
                                {websiteName}
                            </span>
                        </Link>
                        <div className="flex items-center gap-2">
                            {/* Mobile toggles */}
                            <ThemeToggle />
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="size-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>
                                            <Link
                                                href={"/"}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                                    <span className="text-primary-foreground font-bold text-lg">
                                                        V
                                                    </span>
                                                </div>
                                            </Link>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-6 p-4">
                                        <Accordion
                                            type="single"
                                            collapsible
                                            className="flex w-full flex-col gap-4"
                                        >
                                            {menu.map((item) =>
                                                renderMobileMenuItem(item),
                                            )}
                                        </Accordion>

                                        {/* Mobile Settings Section */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                                                {t("settings")}
                                            </h4>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium">
                                                    {t("language")}
                                                </span>
                                                <LanguageToggle />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {t("theme")}
                                                </span>
                                                <ThemeToggle />
                                            </div>
                                        </div>

                                        {/*<div className="flex flex-col gap-3">*/}
                                        {/*  <Button asChild variant="outline">*/}
                                        {/*    <a href={auth.login.url}>{auth.login.title}</a>*/}
                                        {/*  </Button>*/}
                                        {/*  <Button asChild>*/}
                                        {/*    <a href={auth.signup.url}>{auth.signup.title}</a>*/}
                                        {/*  </Button>*/}
                                        {/*</div>*/}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="cursor-pointer px-3 py-2 text-base font-medium"
                    >
                        {item.title}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    sideOffset={8}
                    className="bg-popover text-popover-foreground shadow-xl border w-80 p-2"
                >
                    <div className="flex flex-col gap-1">
                        {item.items.map((subItem) => (
                            <SubMenuLink key={subItem.title} item={subItem} />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Button
            asChild
            variant="ghost"
            className="px-3 py-2 text-base font-medium"
        >
            <Link href={item.url}>{item.title}</Link>
        </Button>
    );
};

const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
        return (
            <AccordionItem
                key={item.title}
                value={item.title}
                className="border-b-0"
            >
                <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent className="mt-2">
                    {item.items.map((subItem) => (
                        <SubMenuLink key={subItem.title} item={subItem} />
                    ))}
                </AccordionContent>
            </AccordionItem>
        );
    }

    return (
        <a key={item.title} href={item.url} className="text-md font-semibold">
            {item.title}
        </a>
    );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
    return (
        <a
            className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
            href={item.url}
        >
            <div className="text-foreground">{item.icon}</div>
            <div>
                <div className="text-sm font-semibold">{item.title}</div>
                {item.description && (
                    <p className="text-sm leading-snug text-muted-foreground">
                        {item.description}
                    </p>
                )}
            </div>
        </a>
    );
};
