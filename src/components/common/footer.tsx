import { getLocale, getTranslations } from "next-intl/server";
import { LuMail } from "react-icons/lu";
import { SiDiscord, SiGithub, SiX, SiXiaohongshu } from "react-icons/si";
import Container from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/service/tool-service";

const socialLinks = [
  {
    icon: SiGithub,
    title: "GitHub",
    href: "https://github.com/victorymakes/victoryhub",
  },
  {
    icon: SiX,
    title: "Twitter",
    href: "https://x.com/victorymakes",
  },
  {
    icon: SiDiscord,
    title: "Discord",
    href: "https://discord.gg/2jXtp466",
  },
  {
    icon: SiXiaohongshu,
    title: "Xiaohongshu",
    href: "https://www.xiaohongshu.com/user/profile/605834f00000000001002dfc",
  },
  {
    icon: LuMail,
    title: "Author",
    href: "https://me.victoryhub.cc/#contact",
  },
];

export async function Footer() {
  const tNav = await getTranslations("Navigation");
  const tFooter = await getTranslations("Footer");
  const locale = await getLocale();
  const categories = await getCategories(locale);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  V
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                VictoryHub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {tFooter("description")}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.title}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Link href={link.href} target="_blank" rel="noopener">
                      <Icon className="size-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {tNav("tools")}
            </h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={
                      category.slug === ""
                        ? "/tools"
                        : `/tools#${category.slug}`
                    }
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {tFooter("navigation")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("tools")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tNav("blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal/Info Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {tFooter("information")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tFooter("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tFooter("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tFooter("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {tFooter("copyright", { year: currentYear })}
          </p>
          <p className="text-sm text-muted-foreground">{tFooter("madeWith")}</p>
        </div>
      </Container>
    </footer>
  );
}
