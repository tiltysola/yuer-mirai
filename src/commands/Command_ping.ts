import {send_private_msg_ping, send_group_msg_ping} from './CQReply'

export const Ping_Private = function (ws: any, user_id: any, ping: any) {
  console.log('[Debug]', 'Receive command: Ping, User_ID:', user_id)
  send_private_msg_ping(ws, user_id, ping)
}

export const Ping_Group = function (ws: any, group_id: any, ping: any) {
  console.log('[Debug]', 'Receive command: Ping, Group_ID:', group_id)
  send_group_msg_ping(ws, group_id, ping)
}