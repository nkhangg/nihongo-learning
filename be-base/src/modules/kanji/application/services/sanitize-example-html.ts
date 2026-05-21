import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML used in KanjiExample.jpHtml.
 * Whitelist: <ruby>, <rt>, <em>, <span class="highlight">.
 * Everything else is stripped to prevent XSS via dangerouslySetInnerHTML in clients.
 */
export function sanitizeExampleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['ruby', 'rt', 'em', 'span'],
    allowedAttributes: {
      span: ['class'],
    },
    allowedClasses: {
      span: ['highlight'],
    },
    disallowedTagsMode: 'discard',
  });
}
