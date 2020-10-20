import {send_private_msg, send_group_msg} from './CQReply'

export const Nyaa_Private = function (ws: any, user_id: any) {
  console.log('[Debug]', 'Receive command: Nyaa, User_ID:', user_id)
  send_private_msg(ws, user_id, nyaa())
}

export const Nyaa_Group = function (ws: any, group_id: any) {
  console.log('[Debug]', 'Receive command: Nyaa, Group_ID:', group_id)
  send_group_msg(ws, group_id, nyaa())
}

function nyaa () {
  return '噗，你是说尼娅啊，好人~'
}