import { m } from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime.js";

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  it: "it_IT",
};

function setMeta(
  key: string,
  content: string,
  attribute: "name" | "property" = "name",
) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

export function updateDocumentSeo() {
  const title = m.page_title();
  const description = m.app_description();
  const keywords = m.seo_keywords();
  const locale = getLocale();
  const pageUrl = new URL(window.location.pathname, window.location.origin).href;
  const imageUrl = new URL("/og-image.svg", window.location.origin).href;

  document.title = title;
  document.documentElement.lang = locale;

  setMeta("description", description);
  setMeta("keywords", keywords);
  setMeta("og:type", "website", "property");
  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:url", pageUrl, "property");
  setMeta("og:image", imageUrl, "property");
  setMeta("og:locale", OG_LOCALES[locale] ?? locale, "property");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", imageUrl);
}
