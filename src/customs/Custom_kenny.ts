import request from 'request'
import md5 from 'md5'

import {send_private_msg, send_group_msg} from '../commands/CQReply'

export const Kenny_Private = function (ws: any, user_id: any, args: any) {
  // console.log(args)
}

export const Kenny_Group = function (ws: any, user_id: any, group_id: any, args: any) {
  // 判断涉及 Kenny 的回复
  const msg = args.join(' ')
  const kennyAlias = ['Kenny', 'kenny', '肯尼', '啃泥']
  const reply = [
    '你是在说啃泥吗，他是大家的RBQ哦！',
    '你刚才提到了啃泥吗，可是可是公车呢！',
    '啃泥！啃BQ！',
    '有朋自天上来，啃泥就是RBQ！',
    '啃泥作为大家的RBQ可一定要好好努力哦！',
    '啃泥其实是群主的私车（小声'
  ]
  let have = false
  kennyAlias.forEach((v: any) => {
    if (msg.includes(v)) {
      have = true
    }
  })
  if (group_id == 590780017 && have) {
    console.log('[Debug]', 'Receive command: Kenny, User_ID:', user_id, ': Group_ID:', group_id, ': Msg:', args)
    send_group_msg(ws, group_id, reply[Math.ceil(Math.random() * reply.length - 1)])
  }
  return // 截断后续处理
}