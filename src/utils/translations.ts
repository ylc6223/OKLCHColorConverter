import { Language } from '../types';

export const translations = {
  en: {
    title: 'OKLCH Color Picker & Converter',
    lightness: 'Lightness',
    chroma: 'Chroma',
    hue: 'Hue',
    alpha: 'Alpha',
    show3D: 'Show 3D',
    showGraphs: 'Show graphs',
    showP3: 'Show P3',
    showRec2020: 'Show Rec2020',
    pasteHex: 'Paste HEX/RGB/HSL to convert to OKLCH',
    pasteLch: 'Paste HEX/RGB/HSL to convert to LCH',
    whyOklch: 'Why OKLCH is better than RGB',
    evilMartians: 'Made at Evil Martians,\ndevtools building consultancy.\nBy Andrey Sitnik & Roman Shamin',
    github: 'ylc6223 / OKLCHColorConverter',
    lightnessVsChroma: 'Lightness vs Chroma',
    chromaVsHue: 'Chroma vs Hue',
    hueVsLightness: 'Hue vs Lightness',
    colorSpace3D: '3D Color Space',
    visualization3D: '3D Visualization',
    language: 'Language',
    theme: 'Theme',
    settings: 'Settings',
    footer: {
      copyright: 'Color Converter Tool. All rights reserved.',
      madeBy: 'Made by',
      creator: 'ylc6223',
      thanks: 'Inspired by',
      and: 'and the',
      community: 'open source community'
    }
  },
  zh: {
    title: 'OKLCH 颜色选择器和转换器',
    lightness: '亮度',
    chroma: '色度',
    hue: '色相',
    alpha: '透明度',
    show3D: '显示 3D',
    showGraphs: '显示图表',
    showP3: '显示 P3',
    showRec2020: '显示 Rec2020',
    pasteHex: '粘贴 HEX/RGB/HSL 转换为 OKLCH',
    pasteLch: '粘贴 HEX/RGB/HSL 转换为 LCH',
    whyOklch: '为什么 OKLCH 比 RGB 更好',
    evilMartians: '由 Evil Martians 制作，\n开发工具构建咨询公司。\n作者：Andrey Sitnik 和 Roman Shamin',
    github: 'ylc6223 / OKLCHColorConverter',
    lightnessVsChroma: '亮度 vs 色度',
    chromaVsHue: '色度 vs 色相',
    hueVsLightness: '色相 vs 亮度',
    colorSpace3D: '3D 色彩空间',
    visualization3D: '3D 可视化',
    language: '语言',
    theme: '主题',
    settings: '设置',
    footer: {
      copyright: '颜色转换工具。保留所有权利。',
      madeBy: '制作者',
      creator: 'ylc6223',
      thanks: '感谢',
      and: '和',
      community: '开源社区'
    }
  }
};

type TranslationKey = keyof typeof translations.en | `footer.${keyof typeof translations.en.footer}`;

export const t = (key: TranslationKey, language: Language): string => {
  if (key.includes('.')) {
    const [section, subKey] = key.split('.') as [keyof typeof translations.en, string];
    const sectionData = translations[language][section] || translations.en[section];
    if (typeof sectionData === 'object' && sectionData !== null) {
      return (sectionData as any)[subKey] || (translations.en[section] as any)[subKey] || key;
    }
  }
  return (translations[language][key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en]) as string;
};