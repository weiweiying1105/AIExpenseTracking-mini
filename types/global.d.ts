/// <reference types="@tarojs/taro" />
/// <reference types="@taro-hooks/plugin-react" />
import '@taro-hooks/plugin-react';

// 图片资源模块声明
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.ico' {
  const src: string;
  export default src;
}
declare module '*.bmp' {
  const src: string;
  export default src;
}

// 样式文件模块声明
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.sass' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.styl' {
  const classes: { [key: string]: string };
  export default classes;
}

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
  }
}

// 全局常量声明
declare const API_BASE_URL: string


