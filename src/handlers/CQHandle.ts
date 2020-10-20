import ws from 'ws'
import Bot from '../models/bot'

import { onMsg } from '../commands/CQReply'

import {Help_Private, Help_Group} from '../commands/Command_help'
import {Ping_Private, Ping_Group} from '../commands/Command_ping'
import {Search_Private, Search_Group} from '../commands/Command_search'
import {Gate_Private, Gate_Group} from '../commands/Command_gate'
import {Trap_Private, Trap_Group} from '../commands/Command_trap'
import {Nuannuan_Private, Nuannuan_Group} from '../commands/Command_nuannuan_new'
import {Treasure_Private, Treasure_Group} from '../commands/Command_treasure'
import {Hso_Private, Hso_Group} from '../commands/Command_hso'
import {Weather_Private, Weather_Group} from '../commands/Command_weather'
import {Dps_Private, Dps_Group} from '../commands/Command_dps'
import {Fsx_Private, Fsx_Group} from '../commands/Command_fsx'
import {Dice_Private, Dice_Group} from '../commands/Command_dice'
import {Macro_Private, Macro_Group} from '../commands/Command_macro'
import {Blue_Private, Blue_Group} from '../commands/Command_blue'
import {Luck_Private, Luck_Group} from '../commands/Command_luck'
import {Image_Private, Image_Group} from '../commands/Command_image'
import {Nyaa_Private, Nyaa_Group} from '../commands/Command_nyaa'
import {Porn_Private, Porn_Group} from '../commands/Command_porn'
import {Abuse_Private, Abuse_Group} from '../commands/Command_abuse'
import {Mc_Private, Mc_Group} from '../commands/Command_mc'
import {Yuer_Private, Yuer_Group} from '../commands/Command_yuer'

import {TTAdd, TTHandle} from './TTHandle'
import {HandleCustomPrivateMsg, HandleCustomGroupMsg} from './CMHandle'
import {SCHandle} from './SCHandle'

import alias from '../configs/alias'

const CQHandle = function (this: any, wss: ws.Server) {
  if (!this.wss)
    this.wss = wss
  wss.on('connection', (ws: any, req: any) => {
    // 收到连接请求
    const remote_address = req.connection.remoteAddress
    console.log('[Debug]', 'Connection established: ', remote_address)
    // 初始化BOT信息
    const cq_info = {
      user_id: null,
      nickname: null
    }
    ws.send(JSON.stringify({
      action: 'get_version_info'
    }))
    ws.send(JSON.stringify({
      action: 'get_login_info'
    }))
    ws.on('message', (msg: any) => {
      msg = JSON.parse(msg)
      if (msg.data) {
        if (msg.data && msg.data.nickname) {
          cq_info.user_id = msg.data.user_id
          cq_info.nickname = msg.data.nickname
          if (cq_info.nickname) {
            console.log('[Debug]', 'CQInfo fetched: ', cq_info)
            TTAdd(msg.data.user_id, ws)
            SCHandle(msg.data.user_id, ws)
          }
        } else if (msg.data && msg.data.message_id) {
          onMsg(ws, msg)
        }
      } else {
        // 判断BOT是否注册
        Bot.findOne({ user_id: cq_info.user_id }, (err, res) => {
          if (err)
            console.log('[Error]', err)
          else {
            if (res) {
              // BOT已注册，开始处理消息
              HandleMsg(ws, msg, cq_info, res)
              // 更新BOT在数据库内的昵称
              Bot.updateOne({ user_id: cq_info.user_id }, {
                nickname: cq_info.nickname
              }, (err, res) => {
                if (err) {
                  console.log('[Error]', err)
                }
              })
            }
          }
        })
      }
    })
    ws.on('close', () => {
      console.log('[Debug]', 'Connection closed: ', remote_address)
      TTAdd(cq_info.user_id, null)
    })
  })
}

const HandleMsg = function (ws: any, msg: any, cq_info: any, res: any) {
  // 处理用户消息
  if (msg.post_type === 'meta_event') {
    if (msg.meta_event_type === 'heartbeat') {
      // 心跳包处理 // 设置bot在线状态
      Bot.findOne({ user_id: cq_info.user_id }, (err, res) => {
        if (err)
          console.log('[Error]', err)
        else {
          if (res) {
            let time = new Date().getTime()
            Bot.updateOne({ user_id: cq_info.user_id }, { online: time }, (err, res) => {
              if (err) {
                console.log('[Error]', err)
              } else {
                // console.log('[Debug] Bot %s online time has been set to: %s', cq_info.user_id, time)
              }
            })
          }
        }
      })
    }
  } else if (msg.post_type === 'message') {
    // 判断是否处理消息
    msg.message = msg.message.replace(/(^\s*)|(\s*$)/g, '')
    if (msg.message.substr(0, 1) === '!' || alias.symble.includes(msg.message.substr(0, 1))) {
      if (res.use_private && msg.message_type === 'private') {
        // 处理私聊消息
        console.log('[Debug] User %s triggered a command: %s', msg.user_id, msg.message)
        HandlePrivateMsg(ws, msg, cq_info)
      } else if (res.use_group && msg.message_type === 'group' && (res.allow_groups.includes(msg.group_id) || res.allow_groups.includes('*')) && !res.ban_groups.includes(msg.group_id)) {
        // 处理群消息
        console.log('[Debug] User %s in Group %s triggered a command: %s', msg.user_id, msg.group_id, msg.message)
        HandleGroupMsg(ws, msg, cq_info)
      }
    } else if (msg.message.substr(0, 1) === '/' || alias.symble_tata.includes(msg.message.substr(0, 1))) {
      // 处理獭獭消息
      Bot.findOne({ user_id: cq_info.user_id }, (err, res: any) => {
        if (err)
          console.log('[Error]', err)
        else {
          if (res && res.use_tata === true && res.tata_url && res.tata_access) {
            TTHandle(msg, res.tata_url, res.tata_access, cq_info.user_id)
          }
        }
      })
    } else {
      // 通用处理逻辑
      if (res.use_private && msg.message_type === 'private') {
        // 处理私聊消息
        HandleCustomPrivateMsg(ws, msg, cq_info)
      } else if (res.use_group && msg.message_type === 'group' && (res.allow_groups.includes(msg.group_id) || res.allow_groups.includes('*')) && !res.ban_groups.includes(msg.group_id)) {
        // 处理群消息
        HandleCustomGroupMsg(ws, msg, cq_info)
      }
    }
  }
}

const HandlePrivateMsg = function (ws: any, msg: any, cq_info: any) {
  let msg_wo_symble = msg.message.substr(1).replace(/\[CQ/g, ' [CQ').replace(/\r\n/g, ' ').replace(/\n/g, ' ')
  let msg_array_raw = msg_wo_symble.split(' ')
  let msg_array = []
  for (let i = 0; i < msg_array_raw.length; i++) {
    if (msg_array_raw[i] !== '') {
      msg_array.push(msg_array_raw[i])
    }
  }
  if (msg_array[0])
    msg_array[0] = msg_array[0].toLowerCase()
  if (msg_array[0] === 'help' || alias.help.includes(msg_array[0])) {
    Help_Private(ws, msg.user_id)
  } else if (msg_array[0] === 'ping' || alias.ping.includes(msg_array[0])) {
    Ping_Private(ws, msg.user_id, new Date().getTime())
  } else if (msg_array[0] === 'search' || alias.search.includes(msg_array[0])) {
    Search_Private(ws, msg.user_id, msg_array[1])
  } else if (msg_array[0] === 'gate' || alias.gate.includes(msg_array[0])) {
    Gate_Private(ws, msg.user_id, cq_info, msg_array[1])
  } else if (msg_array[0] === 'gate3') {
    Gate_Private(ws, msg.user_id, cq_info, '3')
  } else if (msg_array[0] === 'trap' || alias.trap.includes(msg_array[0])) {
    Trap_Private(ws, msg.user_id, cq_info, msg_array[1])
  } else if (msg_array[0] === 'dice' || alias.dice.includes(msg_array[0])) {
    Dice_Private(ws, msg.user_id, msg_array[1])
  } else if (msg_array[0] === 'nuannuan' || alias.nuannuan.includes(msg_array[0])) {
    Nuannuan_Private(ws, msg.user_id, cq_info)
  } else if (msg_array[0] === 'treasure' || alias.treasure.includes(msg_array[0])) {
    Treasure_Private(ws, msg.user_id, cq_info, msg_array[1])
  } else if (msg_array[0] === 'hso' || alias.hso.includes(msg_array[0])) {
    Hso_Private(ws, msg.user_id, cq_info, msg_array[1], msg_array[2])
  } else if (msg_array[0] === 'weather' || alias.weather.includes(msg_array[0])) {
    Weather_Private(ws, msg.user_id, msg_array[1])
  } else if (msg_array[0] === 'dps' || alias.dps.includes(msg_array[0])) {
    Dps_Private(ws, msg.user_id, msg_array)
  } else if (msg_array[0] === 'fsx' || alias.fsx.includes(msg_array[0])) {
    Fsx_Private(ws, msg.user_id, msg_array[1], msg_array[2])
  } else if (alias.fsx_child.includes(msg_array[0])) {
    Fsx_Private(ws, msg.user_id, msg_array[0], msg_array[1])
  } else if (msg_array[0] === 'macro' || alias.macro.includes(msg_array[0])) {
    Macro_Private(ws, msg.user_id, msg_array[1], msg_array[2])
  } else if (msg_array[0] === 'blue' || alias.blue.includes(msg_array[0])) {
    Blue_Private(ws, msg.user_id, msg_array[1])
  } else if (msg_array[0] === 'luck' || alias.luck.includes(msg_array[0])) {
    Luck_Private(ws, msg.user_id, cq_info)
  } else if (msg_array[0] === 'image' || alias.image.includes(msg_array[0])) {
    Image_Private(ws, msg.user_id, msg_array[1], msg_array[2], msg_array[3])
  } else if (msg_array[0] === 'nyaa' || alias.nyaa.includes(msg_array[0])) {
    Nyaa_Private(ws, msg.user_id)
  } else if (msg_array[0] === 'porn' || alias.porn.includes(msg_array[0])) {
    Porn_Private(ws, msg.user_id, cq_info, msg_array.slice(1).join(' '))
  } else if (msg_array[0] === 'abuse' || alias.abuse.includes(msg_array[0])) {
    Abuse_Private(ws, msg.user_id, cq_info, msg_array.slice(1).join(' '))
  } else if (msg_array[0] === 'mc' || alias.mc.includes(msg_array[0])) {
    Mc_Private(ws, msg.user_id, cq_info, msg_array[1], msg_array[2], msg_array[3])
  } else if (msg_array[0] === 'yuer' || alias.yuer.includes(msg_array[0])) {
    Yuer_Private(ws, msg.user_id)
  }
}

const HandleGroupMsg = function (ws: any, msg: any, cq_info: any) {
  let msg_wo_symble = msg.message.substr(1).replace(/\[CQ/g, ' [CQ').replace(/\r\n/g, ' ').replace(/\n/g, ' ')
  let msg_array_raw = msg_wo_symble.split(' ')
  let msg_array = []
  for (let i = 0; i < msg_array_raw.length; i++) {
    if (msg_array_raw[i] !== '') {
      msg_array.push(msg_array_raw[i])
    }
  }
  if (msg_array[0])
    msg_array[0] = msg_array[0].toLowerCase()
  if (msg_array[0] === 'help' || alias.help.includes(msg_array[0])) {
    Help_Group(ws, msg.group_id)
  } else if (msg_array[0] === 'ping' || alias.ping.includes(msg_array[0])) {
    Ping_Group(ws, msg.group_id, new Date().getTime())
  } else if (msg_array[0] === 'search' || alias.search.includes(msg_array[0])) {
    Search_Group(ws, msg.group_id, msg_array[1])
  } else if (msg_array[0] === 'gate' || alias.gate.includes(msg_array[0])) {
    Gate_Group(ws, msg.group_id, cq_info, msg_array[1])
  } else if (msg_array[0] === 'gate3') {
    Gate_Group(ws, msg.group_id, cq_info, '3')
  } else if (msg_array[0] === 'trap' || alias.trap.includes(msg_array[0])) {
    Trap_Group(ws, msg.group_id, cq_info, msg_array[1])
  } else if (msg_array[0] === 'dice' || alias.dice.includes(msg_array[0])) {
    Dice_Group(ws, msg.group_id, msg.user_id, msg_array[1])
  } else if (msg_array[0] === 'nuannuan' || alias.nuannuan.includes(msg_array[0])) {
    Nuannuan_Group(ws, msg.group_id, cq_info)
  } else if (msg_array[0] === 'treasure' || alias.treasure.includes(msg_array[0])) {
    Treasure_Group(ws, msg.group_id, cq_info, msg_array[1])
  } else if (msg_array[0] === 'hso' || alias.hso.includes(msg_array[0])) {
    Hso_Group(ws, msg.group_id, cq_info, msg_array[1], msg_array[2])
  } else if (msg_array[0] === 'weather' || alias.weather.includes(msg_array[0])) {
    Weather_Group(ws, msg.group_id, msg_array[1])
  } else if (msg_array[0] === 'dps' || alias.dps.includes(msg_array[0])) {
    Dps_Group(ws, msg.group_id, msg_array)
  } else if (msg_array[0] === 'fsx' || alias.fsx.includes(msg_array[0])) {
    Fsx_Group(ws, msg.group_id, msg_array[1], msg_array[2])
  } else if (alias.fsx_child.includes(msg_array[0])) {
    Fsx_Group(ws, msg.group_id, msg_array[0], msg_array[1])
  } else if (msg_array[0] === 'macro' || alias.macro.includes(msg_array[0])) {
    Macro_Group(ws, msg.group_id, msg_array[1], msg_array[2])
  } else if (msg_array[0] === 'blue' || alias.blue.includes(msg_array[0])) {
    Blue_Group(ws, msg.group_id, msg_array[1])
  } else if (msg_array[0] === 'luck' || alias.luck.includes(msg_array[0])) {
    Luck_Group(ws, msg.group_id, msg.user_id, cq_info)
  } else if (msg_array[0] === 'image' || alias.image.includes(msg_array[0])) {
    Image_Group(ws, msg.group_id, msg_array[1], msg_array[2], msg_array[3])
  } else if (msg_array[0] === 'nyaa' || alias.nyaa.includes(msg_array[0])) {
    Nyaa_Group(ws, msg.group_id)
  } else if (msg_array[0] === 'porn' || alias.porn.includes(msg_array[0])) {
    Porn_Group(ws, msg.group_id, cq_info, msg_array.slice(1).join(' '))
  } else if (msg_array[0] === 'abuse' || alias.abuse.includes(msg_array[0])) {
    Abuse_Group(ws, msg.group_id, cq_info, msg_array.slice(1).join(' '))
  } else if (msg_array[0] === 'mc' || alias.mc.includes(msg_array[0])) {
    Mc_Group(ws, msg.group_id, cq_info, msg_array[1], msg_array[2], msg_array[3])
  } else if (msg_array[0] === 'yuer' || alias.yuer.includes(msg_array[0])) {
    Yuer_Group(ws, msg.group_id)
  }
}

export default CQHandle