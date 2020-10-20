import {send_private_msg, send_group_msg} from '../commands/CQReply'

export const Test = (user_id: any, ws: any) => {
  if (user_id == 2152002367) {
    console.log('[Debug]', 'Create schedule: test, User_ID:', user_id)
    send_group_msg(ws, 780716687, '远程代码发生变更，BOT重新部署完毕！')
    setInterval(() => {
      send_group_msg(ws, 780716687, '每小时发一次，证明爷还活着。')
    }, 3600000)
  }
}