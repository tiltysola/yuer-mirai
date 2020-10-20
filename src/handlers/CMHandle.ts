import {TencentAI_Private, TencentAI_Group} from '../customs/Custom_tencentai'
import {Kenny_Private, Kenny_Group} from '../customs/Custom_kenny'

export const HandleCustomPrivateMsg = function (ws: any, msg: any, cq_info: any) {
  let msg_wo_symble = msg.message.substr(1).replace(/\[CQ/g, ' [CQ').replace(/\r\n/g, ' ').replace(/\n/g, ' ')
  let msg_array_raw = msg_wo_symble.split(' ')
  let msg_array = []
  for (let i = 0; i < msg_array_raw.length; i++) {
    if (msg_array_raw[i] !== '') {
      msg_array.push(msg_array_raw[i])
    }
  }
  Custom_Private(ws, msg.user_id, msg_array)
}

export const HandleCustomGroupMsg = function (ws: any, msg: any, cq_info: any) {
  let msg_wo_symble = msg.message.replace(/\[CQ(.+?)]/g, ' [CQ$1] ').replace(/\r\n/g, ' ').replace(/\n/g, ' ')
  let msg_array_raw = msg_wo_symble.split(' ')
  let msg_array = []
  for (let i = 0; i < msg_array_raw.length; i++) {
    if (msg_array_raw[i] !== '') {
      msg_array.push(msg_array_raw[i])
    }
  }
  Custom_Group(ws, msg.user_id, msg.group_id, msg_array)
}

const Custom_Private = function (ws: any, user_id: any, args: any) {
  Kenny_Private(ws, user_id, args)
  TencentAI_Private(ws, user_id, args)
}

const Custom_Group = function (ws: any, user_id: any, group_id: any, args: any) {
  Kenny_Group(ws, user_id, group_id, args)
  TencentAI_Group(ws, user_id, group_id, args)
}