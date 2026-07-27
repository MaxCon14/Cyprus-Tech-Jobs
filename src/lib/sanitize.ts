import sanitizeHtml from "sanitize-html";

/**
 * Sanitiser for job descriptions.
 *
 * Descriptions are authored in a rich-text editor and stored as HTML, then
 * rendered with dangerouslySetInnerHTML on the public job page. Nothing used to
 * clean them, so anyone who registered as an employer could put a <script> tag
 * — or an onerror handler, or a javascript: link — in a description and run
 * code on cyprustech.careers for every visitor who opened that listing.
 *
 * The allowlist is deliberately the exact output of the editor's toolbar
 * (TipTap StarterKit: headings 1–3, bold, italic, strike, and the two list
 * types) and nothing else. No attributes are permitted at all: the editor emits
 * none, so `class`, `style`, `href` and every event handler are dropped rather
 * than filtered, which removes CSS-based and URL-based tricks along with the
 * obvious script injection.
 *
 * Applied on write in every route that stores a description, and again on read
 * where it is rendered — descriptions written before this existed are still in
 * the database, and a future write path that forgets to call this should not be
 * enough to put script on the page.
 */

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br",
    "strong", "b", "em", "i", "s", "u",
    "h1", "h2", "h3",
    "ul", "ol", "li",
  ],
  // No attributes on any tag. The editor produces none.
  allowedAttributes: {},
  // Drop the contents of these outright rather than leaving the inner text
  // behind, which is the default for non-allowed tags.
  nonTextTags: ["style", "script", "textarea", "option", "noscript", "iframe"],
  allowedSchemes: [],
  disallowedTagsMode: "discard",
};

export function sanitizeJobHtml(input: unknown): string {
  if (typeof input !== "string" || !input) return "";
  return sanitizeHtml(input, OPTIONS).trim();
}
