export function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadTime(text) {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function parseHeadings(content) {
  if (!content) return [];
  return content
    .split('\n')
    .filter(line => /^#{2,3}\s/.test(line))
    .map(line => {
      const isH2 = line.startsWith('## ');
      const text = line.replace(/^#{2,3}\s+/, '').trim();
      return {
        text,
        id: slugify(text),
        level: isH2 ? 2 : 3
      };
    });
}
