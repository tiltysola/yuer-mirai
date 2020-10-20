import {send_private_msg, send_group_msg} from './CQReply'

export const Gate_Private = function (ws: any, user_id: any, cq_info: any, input_num: any) {
  console.log('[Debug]', 'Receive command: Gate, User_ID:', user_id, ': Input_Num:', input_num)
  send_private_msg(ws, user_id, gate(cq_info, input_num))
}

export const Gate_Group = function (ws: any, group_id: any, cq_info: any, input_num: any) {
  console.log('[Debug]', 'Receive command: Gate, Group_ID:', group_id, ': Input_Num:', input_num)
  send_group_msg(ws, group_id, gate(cq_info, input_num))
}

function gate (cq_info: any, input_num: any) {
  let num = Math.floor(Math.random() * 2)
  if (input_num === '3')
    num = Math.floor(Math.random() * 3)
  let msg = cq_info.nickname + '认为应该走{{where}}的门，相信' + cq_info.nickname + '没错的！'
  if (num === 0) {
    msg = msg.replace('{{where}}', '左边')
  } else if (num === 1) {
    msg = msg.replace('{{where}}', '右边')
  } else if (num === 2) {
    msg = msg.replace('{{where}}', '中间')
  }
  return msg
}