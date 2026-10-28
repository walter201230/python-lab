import { serializeJsonLd } from '@/lib/siteMetadata';

/** 结构化数据是数据而非可执行代码，按 Next 指南使用原生 <script>，在服务端随静态 HTML 输出。 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
