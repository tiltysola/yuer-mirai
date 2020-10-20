import Luck from '../models/luck'

import {send_private_msg, send_group_msg} from './CQReply'

import luck_data from './luck/luck'

let luck_lst: any = luck_data()

export const Luck_Private = function (ws: any, user_id: any, cq_info: any) {
  console.log('[Debug]', 'Receive command: Luck, User_ID:', user_id)
  luck(user_id, cq_info, (res: any) => {
    send_group_msg(ws, user_id, res)
  })
}

export const Luck_Group = function (ws: any, group_id: any, user_id: any, cq_info: any) {
  console.log('[Debug]', 'Receive command: Luck, Group_ID:', group_id)
  luck(user_id, cq_info, (res: any) => {
    send_group_msg(ws, group_id, '[CQ:at, qq=' + user_id + ']\n' + res)
  })
}

function luck (user_id: any, cq_info: any, callback: any) {
  Luck.findOne({ user_id }, (err, res: any) => {
    if (err) {
      console.log('[Error]', err)
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    } else {
      if (res) {
        if (new Date().getTime() > Math.floor(res.time / 86400000 + 1) * 86400000) {
          exec_luck(user_id, cq_info, callback)
        } else {
          callback('您已经抽过签了哦，请明早8点以后再次抽签！')
        }
      } else {
        exec_luck(user_id, cq_info, callback)
      }
    }
  })
}

function exec_luck (user_id: any, cq_info: any, callback: any) {
  let num = Math.floor(Math.random() * luck_lst.length)
  Luck.findOne({ user_id }, (err, res: any) => {
    if (err) {
      console.log('[Error]', err)
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    } else {
      if (res) {
        Luck.updateOne({ user_id }, {
          num,
          time: new Date().getTime()
        }, (err) => {
          if (err) {
            console.log('[Error]', err)
            callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
          } else {
            // if (cq_info.version === 'pro') {
              callback('[CQ:image, file=' + luck_lst[num].fields.img_url + ']')
            // } else {
            //   callback(luck_lst[num].fields.text)
            // }
          }
        })
      } else {
        Luck.create({
          user_id, num,
          time: new Date().getTime()
        }).then(() => {
          // if (cq_info.version === 'pro') {
            callback('[CQ:image, file=' + luck_lst[num].fields.img_url + ']')
          // } else {
          //   callback(luck_lst[num].fields.text)
          // }
        }).catch((err) => {
          console.log('[Error]', err)
          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
        })
      }
    }
  })
}