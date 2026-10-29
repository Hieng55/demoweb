import { ArrowUpRight } from 'lucide';

export function initializeDirectionalIcons(root = document) {
  const targets = root.querySelectorAll('a, button');

  targets.forEach((target) => {
    // Footer navigation links are compact, wrapping text links. Keeping their
    // arrow as a text glyph avoids custom-element sizing overflow on mobile.
    if (target.closest('.site-footer__links')) return;

    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const arrowNodes = [];

    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue?.includes('↗')) arrowNodes.push(walker.currentNode);
    }

    arrowNodes.forEach((textNode) => {
      const parts = textNode.nodeValue.split('↗');
      const fragment = document.createDocumentFragment();

      parts.forEach((part, index) => {
        if (part) fragment.append(document.createTextNode(part));
        if (index === parts.length - 1) return;

        const icon = document.createElement('morph-icon');
        icon.className = 'external-link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('size', '18');
        icon.setAttribute('stroke-width', '1.8');
        icon.icon = ArrowUpRight;
        fragment.append(icon);
      });

      textNode.replaceWith(fragment);
    });
  });
}
