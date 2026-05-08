import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({
  html: false,
  typographer: true,
  breaks: true,
  linkify: true,
});

// Enable GFM-style task lists with clickable checkboxes
md.use(taskLists, { enabled: true });

// Add id attributes to headings for TOC navigation
const defaultHeadingOpen = md.renderer.rules.heading_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const nextToken = tokens[idx + 1];
  if (nextToken?.type === 'inline' && nextToken.content) {
    const id = nextToken.content
      .trim()
      .toLowerCase()
      .replace(/[^\wа-яё]+/g, '-')
      .replace(/-+$/, '');
    tokens[idx].attrSet('id', id);
  }
  return defaultHeadingOpen(tokens, idx, options, env, self);
};

// Force every anchor to open in a new tab with rel="noopener noreferrer"
// to prevent tabnabbing via user-authored markdown links.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export const renderMarkdown = (content: string): string => {
  const html = md.render(content);
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'ul', 'ol', 'li',
                   'blockquote', 'pre', 'code', 'a', 'strong', 'em', 'del', 'table',
                   'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'input'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel', 'id', 'type', 'checked', 'disabled'],
    ADD_ATTR: ['rel'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload'],
  });
  // Add data-task-idx so the click handler can identify which markdown item
  // to toggle. The native checkbox handles its own appearance (via accent-color).
  let taskIdx = 0;
  return sanitized.replace(/class="task-list-item-checkbox"/g, () => {
    return `class="task-list-item-checkbox" data-task-idx="${taskIdx++}"`;
  });
};

export default md;
