import {send_private_msg, send_group_msg} from './CQReply'

export const Yuer_Private = function (ws: any, user_id: any) {
  console.log('[Debug]', 'Receive command: Yuer, User_ID:', user_id)
  send_private_msg(ws, user_id, yuer())
}

export const Yuer_Group = function (ws: any, group_id: any) {
  console.log('[Debug]', 'Receive command: Yuer, Group_ID:', group_id)
  send_group_msg(ws, group_id, yuer())
}

function yuer () {
  return '月華介绍：\n' +
    '月儿是一个基于MiraiP实现的一个为FF14服务的淘气机器人！当前还处于初期养成阶段，难免会遇到很多问题的说！不过月儿也在加强练习，争取学会更多的能力为你们服务呢！如果你也想让月儿为你服务的话，你可以前往http://yuer.acgme.cn前往申请测试呢。既然都说了这么多，不妨听我安利一个工具吧，那就是阿莉塞的宏书，可以将你在游戏的宏共享出来与大家一起欣赏哦！'
}