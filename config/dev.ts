import type { UserConfigExport } from "@tarojs/cli"

export default {
  defineConstants: {
    API_BASE_URL: '"http://localhost:3000/api"'
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport<'webpack5'>
