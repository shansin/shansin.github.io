import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const markdown = '# Demo\n\n<iframe src="test"></iframe>\n\nHello';

const p1 = remark().use(remarkRehype).use(rehypeStringify);
console.log("Without:", p1.processSync(markdown).toString());

const p2 = remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });
console.log("With:", p2.processSync(markdown).toString());
