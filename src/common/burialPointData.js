export const commomParam = {
  module: '插件', // 模块
  bd_name: '美智光电', // 事业部名称
  bd_code: 'QT', // 事业部代码，美智没有,只能填其他QT,
  brand_name: '美的', // 品牌名称
  brand_code: 'MIDEA', // 品牌代码
  apptype_name: APPTYPE_NAME, // 设备品类名称
  a0: '', // A0
}

export const event = {
  plugin_page_view: 'plugin_page_view', //页面浏览
  plugin_button_click: 'plugin_button_click', //按钮点击
  plugin_status: 'plugin_status', //载入时获取设备状态
  plugin_function_click_check: 'plugin_function_click_check', //功能控制点击
  plugin_function_click_result: 'plugin_function_click_result', //功能控制点击后服务端返回结果
}
