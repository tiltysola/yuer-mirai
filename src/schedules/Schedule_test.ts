import {Pixiv_Group} from '../commands/Command_pixiv'
import {send_private_msg, send_group_msg} from '../commands/CQReply'

export const Test = (user_id: any, ws: any) => {
  if (user_id == 2152002367) {
    console.log('[Debug]', 'Create schedule: test, User_ID:', user_id)
    // send_group_msg(ws, 780716687, '远程代码发生变更，BOT重新部署完毕！')
    setInterval(() => {
      // send_group_msg(ws, 780716687, '每小时发一次，证明爷还活着。')
      Pixiv_Group(ws, 780716687, {}, '魂魄妖夢+000', '')
    }, 3600000)
  }
}