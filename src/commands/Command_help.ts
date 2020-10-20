import {send_private_msg, send_group_msg} from './CQReply'

import alias from '../configs/alias'

export const Help_Private = function (ws: any, user_id: any) {
  console.log('[Debug]', 'Receive command: Help, User_ID:', user_id)
  send_private_msg(ws, user_id, help())
}

export const Help_Group = function (ws: any, group_id: any) {
  console.log('[Debug]', 'Receive command: Help, Group_ID:', group_id)
  send_group_msg(ws, group_id, help())
}

function help () {
  return '月華FF14功能说明：\n' +
  '★ 基础指令：http://yuer.acgme.cn/help\n' +
  '★ 聊天直接 @ 机器人即可\n' +
  '★ Powered by: 69302630'
  // return '月華FF14功能说明：\n' +
  //   '★ 物品查询：!search <物品名称>, 别名：' + alias.search.join(', ') + '\n' +
  //   '★ 本周暖暖：!nuannuan, 别名：' + alias.nuannuan.join(', ') + '\n' +
  //   '★ 玄学选门：!gate, 三个门使用：!gate3, 别名：' + alias.gate.join(', ') + '\n' +
  //   '★ 挖宝查询：!treasure <藏宝图截图>, 别名：' + alias.treasure.join(', ') + '\n' +
  //   '★ 贪欲陷阱：!trap <数值|1-9>, 别名：' + alias.trap.join(', ') + '\n' +
  //   '★ 投掷子：!dice {数值|n>0|可空}, 别名：' + alias.dice.join(', ') + '\n' +
  //   '★ 好涩哦~：!hso {标签|可空}[格式: miqo\'te, au_ra], 别名：' + alias.hso.join(', ') + '\n' +
  //   '★ 月儿传图：请输入 !image 查看具体使用说明, 别名：' + alias.image.join(', ') + '\n' +
  //   '★ 查看天气：!weather <地图名|中文>, 别名：' + alias.weather.join(', ') + '\n' +
  //   '★ 浅草寺求签：!luck, 别名：' + alias.luck.join(', ') + '\n' +
  //   '★ DPS统计：请输入 !dps 查看具体使用说明, 别名：' + alias.dps.join(', ') + '\n' +
  //   '★ 宏书查询：!macro <宏书ID> <第几条宏>, 别名：' + alias.macro.join(', ') + '\n' +
  //   '★ 副属性计算：!fsx <暴击|直击|等> <数值>, 别名：' + alias.fsx.join(', ') + '\n' +
  //   '★ 青魔法书：!blue <技能ID|技能名称|ALL>, 别名：' + alias.blue.join(', ') + '\n' +
  //   '★ 图片鉴黄：!porn <图片>, 别名：' + alias.porn.join(', ') + '\n' +
  //   '★ 华鸟风月：!mc <游戏昵称>\n' +
  //   '★ 指令符别名：[\'' + alias.symble.join('\' ,  \'') + '\']'
}