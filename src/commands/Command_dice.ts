import {send_private_msg, send_group_msg} from './CQReply'

export const Dice_Private = function (ws: any, user_id: any, input_num: any) {
  console.log('[Debug]', 'Receive command: Dice, User_ID:', user_id, ': Input_Num:', input_num)
  send_private_msg(ws, user_id, dice(input_num))
}

export const Dice_Group = function (ws: any, group_id: any, user_id: any, input_num: any) {
  console.log('[Debug]', 'Receive command: Dice, Group_ID:', group_id, ': Input_Num:', input_num)
  send_group_msg(ws, group_id, '[CQ:at, qq=' + user_id + '] ' + dice(input_num))
}

function dice (input_num: any) {
  let num = 100
  if (input_num && !isNaN(parseInt(input_num)) && parseInt(input_num) > 0) {
    num = input_num
  }
  let msg = '你投掷出了' + Math.floor(Math.random() * num + 1) + '点。'
  return msg
}