export default {
  pages: [
    "pages/profile/index",
    "pages/accounting/index",
    "pages/statistics/index",
    "pages/index/index",
    "pages/login/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "AI记账助手",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#666",
    selectedColor: "#1296db",
    backgroundColor: "#fafafa",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/accounting/index",
        text: "记账",
        iconPath: "assets/icons/accounting.png",
        selectedIconPath: "assets/icons/accounting.png"
      },
      {
        pagePath: "pages/statistics/index",
        text: "统计",
        iconPath: "assets/icons/statistics.png",
        selectedIconPath: "assets/icons/statistics.png"
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/icons/profile.png",
        selectedIconPath: "assets/icons/profile.png"
      }
    ]
  }
};