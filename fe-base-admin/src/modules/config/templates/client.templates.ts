import type { ConfigTemplate } from './index'

const HEADER_VALUE = {
  logo: { mark: '日', text: 'Nihongo', href: '/' },
  navLinks: [
    { href: '/#features', label: 'Tính năng' },
    { href: '/#levels', label: 'Cấp độ' },
    { href: '/#how', label: 'Cách học' },
    { href: '/pricing', label: 'Bảng giá' },
  ],
  actions: [
    { href: '/login', label: 'Đăng nhập', variant: 'ghost' },
    { href: '/register', label: 'Bắt đầu miễn phí', variant: 'primary' },
  ],
}

const FOOTER_VALUE = {
  logo: { mark: '日', text: 'Nihongo', href: '/' },
  links: [
    { href: '/#features', label: 'Tính năng' },
    { href: '/pricing', label: 'Bảng giá' },
    { href: '/blog', label: 'Blog' },
    { href: '#', label: 'Về chúng tôi' },
    { href: '#', label: 'Liên hệ' },
  ],
  copyright: '© {year} Nihongo · Học tiếng Nhật thông minh',
}

export const CLIENT_CONFIG_TEMPLATES: ConfigTemplate[] = [
  {
    key: 'client.header',
    nameI18nKey: 'config.templates.clientHeader.name',
    descriptionI18nKey: 'config.templates.clientHeader.description',
    value: HEADER_VALUE,
    valueKeyOrder: Object.keys(HEADER_VALUE),
    scope: 'public',
    tags: ['client', 'layout', 'header'],
    description: 'Header (logo, nav links, action buttons) cho PublicLayout của client.',
  },
  {
    key: 'client.footer',
    nameI18nKey: 'config.templates.clientFooter.name',
    descriptionI18nKey: 'config.templates.clientFooter.description',
    value: FOOTER_VALUE,
    valueKeyOrder: Object.keys(FOOTER_VALUE),
    scope: 'public',
    tags: ['client', 'layout', 'footer'],
    description:
      'Footer (logo, links, copyright) cho PublicLayout của client. Placeholder {year} sẽ được thay bằng năm hiện tại.',
  },
]
