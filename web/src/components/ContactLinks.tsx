import type { ReactNode } from 'react';

/** 圆形图标 + 标签的联系方式。link 型直接跳转，qrcode 型悬停/点击弹出二维码。 */
type ContactItem = {
  label: string;
  icon: ReactNode;
} & (
  | { href: string; qrcode?: never; qrcodeHint?: never }
  | { href?: never; qrcode: string; qrcodeHint: string }
);

const GithubIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const MailIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const WechatIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.42 6.42 0 01-.246-1.76c0-3.56 3.143-6.448 7.02-6.448.345 0 .684.029 1.017.07-.387-3.478-3.972-6.494-8.602-6.494zM5.785 7.124a1.04 1.04 0 110-2.082 1.04 1.04 0 010 2.082zm5.813 0a1.04 1.04 0 110-2.082 1.04 1.04 0 010 2.082zM23.96 14.607c0-3.24-3.16-5.87-7.055-5.87-3.957 0-7.056 2.63-7.056 5.87s3.1 5.87 7.056 5.87c.868 0 1.703-.13 2.48-.37a.68.68 0 01.56.08l1.487.87a.258.258 0 00.13.04c.127 0 .23-.103.23-.23 0-.057-.024-.112-.038-.167l-.305-1.152a.462.462 0 01.166-.52c1.527-1.1 2.345-2.69 2.345-4.42zm-9.585-1.186a.828.828 0 110-1.656.828.828 0 010 1.656zm5.06 0a.828.828 0 110-1.656.828.828 0 010 1.656z" />
  </svg>
);

const MegaphoneIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4z" />
  </svg>
);

const CONTACTS: ContactItem[] = [
  {
    label: '微信',
    qrcode: '/qrcode-wechat.png',
    qrcodeHint: '扫码加我为朋友',
    icon: WechatIcon,
  },
  {
    label: '公众号',
    qrcode: '/qrcode-mp.png',
    qrcodeHint: '扫码关注 GitHubClub',
    icon: MegaphoneIcon,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/walter201230',
    icon: GithubIcon,
  },
  {
    label: '邮箱',
    href: 'mailto:walterwalter0412001@gmail.com',
    icon: MailIcon,
  },
];

function ItemInner({ item }: { item: ContactItem }) {
  return (
    <>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/15 bg-accent-solid/[0.03] text-fg-muted transition duration-300 group-hover:border-emerald-400/40 group-hover:bg-accent-solid/[0.07] group-hover:text-accent-strong group-hover:shadow-[0_0_20px_rgba(52,211,153,0.18)] group-focus-visible:border-emerald-400/40">
        <span className="opacity-75 transition-opacity duration-300 group-hover:opacity-100">
          {item.icon}
        </span>
      </span>
      <span className="text-sm text-fg-subtle transition-colors duration-300 group-hover:text-accent-strong">
        {item.label}
      </span>
    </>
  );
}

const itemClass =
  'group relative flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1 focus-ring';

export function ContactLinks() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14">
      {CONTACTS.map((item) =>
        item.href ? (
          <a
            key={item.label}
            href={item.href}
            {...(item.href.startsWith('mailto:')
              ? {}
              : { target: '_blank', rel: 'noopener noreferrer' })}
            className={itemClass}
          >
            <ItemInner item={item} />
          </a>
        ) : (
          <button key={item.label} type="button" className={itemClass} aria-label={`显示${item.label}二维码`}>
            <ItemInner item={item} />
            {/* w-max 必需：绝对定位浮层的父级只有图标那么宽，不给宽度会被 shrink-to-fit 压扁 */}
            <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-4 w-max -translate-x-1/2 scale-95 opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus:scale-100 group-focus:opacity-100">
              <span className="flex flex-col items-center gap-2 rounded-xl border border-emerald-400/20 bg-surface p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.qrcode}
                  alt={`${item.label}二维码`}
                  width={176}
                  height={176}
                  loading="lazy"
                  className="h-44 w-44 rounded bg-white"
                />
                <span className="whitespace-nowrap text-xs text-fg-subtle">{item.qrcodeHint}</span>
              </span>
            </span>
          </button>
        ),
      )}
    </div>
  );
}
