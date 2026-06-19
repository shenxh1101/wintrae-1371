export default defineAppConfig({
  pages: [
    'pages/reminder/index',
    'pages/medicine/index',
    'pages/record/index',
    'pages/appointment/index',
    'pages/family/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '家庭用药助手',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F0FDF4'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#22C55E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/reminder/index',
        text: '今日提醒'
      },
      {
        pagePath: 'pages/medicine/index',
        text: '药品柜'
      },
      {
        pagePath: 'pages/record/index',
        text: '服药记录'
      },
      {
        pagePath: 'pages/appointment/index',
        text: '复诊计划'
      },
      {
        pagePath: 'pages/family/index',
        text: '家人共享'
      }
    ]
  }
})
