import request from 'request'

//@ts-ignore
import { MinecraftServerListPing } from 'minecraft-status'

import {send_private_msg, send_group_msg} from './CQReply'

import ids from './mc/ids'

const ids_lst: any = ids()

export const Mc_Private = function (ws: any, user_id: any, cq_info: any, user: any, arg: any, arg2: any) {
  console.log('[Debug]', 'Receive command:  Mc, User_ID:', user_id, ': User:', user, ': Arg:', arg, ': Arg2:', arg2)
  mc(cq_info, user, arg, arg2, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const  Mc_Group = function (ws: any, group_id: any, cq_info: any, user: any, arg: any, arg2: any) {
  console.log('[Debug]', 'Receive command:  Mc, Group_ID:', group_id, ': User:', user, ': Arg:', arg, ': Arg2:', arg2)
  mc(cq_info, user, arg, arg2, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function mc (cq_info: any, user: any, arg: any, arg2: any, callback: any) {
  if (!user) {
    server(cq_info, callback)
  } else {
    if (user == 'help') {
      callback(`华鸟风月-MC1.16.3\n` +
      `帮助：\n` +
      `查询玩家列表：!mc\n` +
      `搜索玩家：!mc search <玩家昵称|模糊查询>\n` +
      `查询玩家状态：!mc <玩家昵称>\n` +
      `查询玩家物品：!mc <玩家昵称> list\n` +
      `查询物品数量：!mc <玩家昵称> have <物品名>`)
    } else if (user == 'search') {
      search(cq_info, arg, callback)
    } else if (user == 'death') {
      death(cq_info, callback)
    } else {
      const userFormat = user.split(':')
      const url = 'http://ddns.acgme.cn:3000?user=' + encodeURIComponent(userFormat[0])
      request({
        url,
        method: 'get',
        json: true
      }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
          if (body.code == 0) {
            if (body.data.length > 1 && userFormat.length == 1) {
              callback(`找到${body.data.length}名叫${user}的用户，请使用[USER]:[N]的方式查询。(1~N~${body.data.length})`)
              return
            }
            if (userFormat.length > 1 && userFormat[1] > body.data.length) {
              callback(`N的值有误，N的范围为 1~N~${body.data.length}`)
              return
            }
            let msg = `华鸟风月-MC1.16.3\n玩家：${user}\n`
            if (arg == 'have') {
              // 判断中文
              let cid = getId(arg2)
              if (cid) {
                arg2 = cid
              }
              let have: any = {
                own: false,
                count: 0,
                pos: []
              }
              body.data[userFormat[1] ? userFormat[1] - 1 : 0].Inventory.forEach((v: any) => {
                if (v.id == `minecraft:${arg2}`) {
                  have.own = true
                  have.count += v.Count
                  have.pos.push(v.Slot)
                }
              })
              if (have.own) {
                msg += `物品：${getName('minecraft:' + arg2)}\n数量：${have.count}\n位置：${have.pos.join(', ')}`
              } else {
                msg += `物品：minecraft:${arg2}\n数量：不存在`
              }
            } else if (arg == 'inv') {
              let inv = {
                own: false,
                id: '',
                count: 0,
                tag: {}
              }
              body.data[userFormat[1] ? userFormat[1] - 1 : 0].Inventory.forEach((v: any) => {
                if (v.Slot == arg2) {
                  inv.own = true
                  inv.id = v.id
                  inv.count = v.Count
                  inv.tag = v.tag
                }
              })
              if (inv.own) {
                msg += `查询栏位：${arg2}\n物品：${getName(inv.id)}\n数量：${inv.count}`
                if (inv.tag) {
                  msg += `\nTag：${JSON.stringify(inv.tag)}`
                }
              } else {
                msg += `查询栏位：${arg2}\n物品：不存在`
              }
            } else if (arg == 'list') {
              let list: any = []
              body.data[userFormat[1] ? userFormat[1] - 1 : 0].Inventory.forEach((v: any) => {
                let slotInfo = v.Slot
                switch (slotInfo) {
                  case -106: slotInfo = '副手'; break
                  case 100: slotInfo = '靴子'; break
                  case 101: slotInfo = '护腿'; break
                  case 102: slotInfo = '胸甲'; break
                  case 103: slotInfo = '头盔'; break
                }
                if (slotInfo < 9) {
                  slotInfo = `快捷栏${slotInfo + 1}`
                } else if (slotInfo < 37) {
                  slotInfo = `背包${slotInfo - 8}`
                }
                list.push({
                  id: v.id,
                  slot: slotInfo,
                  count: v.Count
                })
              })
              msg += `物品列表：`
              if (list.length > 0) {
                list.forEach((v: any) => {
                  msg += `\n${v.slot}: ${getName(v.id)} (Count: ${v.count})`
                })
              } else {
                msg += `\n空`
              }
            } else {
              const data = body.data[userFormat[1] ? userFormat[1] - 1 : 0]
              // 维度
              let dimension = '主世界'
              if (data.Dimension == 'minecraft:the_nether') {
                dimension = '下界'
              } else if (data.Dimension == 'minecraft:the_end') {
                dimension = '末地'
              }
              // 开采次数
              let mined = 0
              Object.keys(data.stats['minecraft:mined']).forEach((v: any) => {
                mined += data.stats['minecraft:mined'][v]
              })
              msg += `等级：${data.XpLevel}\n` +
              // `拥有经验：${data.XpTotal}\n` +
              // `当前血量：${Math.round(data.Health)}\n` +
              // `饱食度：${Math.round(data.foodLevel)}\n` +
              `造成伤害：${data.stats['minecraft:custom']['minecraft:damage_dealt'] / 10}\n` +
              `受到伤害：${data.stats['minecraft:custom']['minecraft:damage_taken'] / 10}\n` +
              `死亡次数：${data.stats['minecraft:custom']['minecraft:deaths']}\n` +
              `击杀生物：${data.stats['minecraft:custom']['minecraft:mob_kills']}\n` +
              `开采次数：${mined}\n` +
              `游戏时间：${(data.stats['minecraft:custom']['minecraft:play_one_minute'] / 72000).toFixed(2)}小时\n` +
              `所在维度：${dimension}`
            }
            callback(msg)
          } else {
            callback(body.msg)
          }
        } else {
          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
        }
      })
    }
  }
}

function server (cq_info: any, callback: any) {
  MinecraftServerListPing.ping(4, 'ddns.acgme.cn', 25565, (err: any, res: any) => {
    if (err) {
      callback(err.toString())
      return
    }
    let msg = `华鸟风月-MC1.16.3\n在线玩家列表：\n${
      res.players.sample ? res.players.sample.map((v: any) => v.name).join(', ') : '无'
    }\n\n★ 更多指令请输入：!mc help`
    callback(msg)
  }, 3000)
}

function search (cq_info: any, user: any, callback: any) {
  const url = 'http://ddns.acgme.cn:3000/search?user=' + encodeURIComponent(user)
  request({
    url,
    method: 'get',
    json: true
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      if (body.code == 0) {
        callback(`找到用户：${body.data.join(', ')}`)
      } else {
        callback(body.msg)
      }
    }
  })
}

function death (cq_info: any, callback: any) {
  const url = 'http://ddns.acgme.cn:3000/all'
  request({
    url,
    method: 'get',
    json: true
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      if (body.code == 0) {
        let total = 0
        let group: any = []
        // return `Rank. ${rank}, ${v.bukkit.lastKnownName} 死亡 ${v.stats['minecraft:custom']['minecraft:deaths']}次\n`
        body.data.forEach((v: any) => {
          if (v.stats['minecraft:custom']['minecraft:deaths']) {
            total += v.stats['minecraft:custom']['minecraft:deaths']
            group.push({
              name: v.bukkit.lastKnownName,
              death: v.stats['minecraft:custom']['minecraft:deaths']
            })
          }
        })
        let msg = `华鸟风月-MC1.16.3\n玩家总计死亡：${total}次\n`
        group = group.sort(sortFilterDeath)
        group.forEach((v: any, i: any) => {
          msg += `Rank. ${i + 1}: ${v.name} 死亡 ${v.death}次\n`
        })
        callback(msg)
        // console.log(group)
      } else {
        callback(body.msg)
      }
    }
  })
}

function sortFilterDeath (a: any, b: any) {
  return b.death - a.death
}

function getName (id: string) {
  const item = id.replace('minecraft:', 'item.minecraft.')
  const block = id.replace('minecraft:', 'block.minecraft.')
  if (ids_lst[item]) {
    return ids_lst[item]
  } else if (ids_lst[block]) {
    return ids_lst[block]
  } else {
    return id
  }
}

function getId (name: string) {
  let ret = false
  Object.keys(ids_lst).forEach((v: any) => {
    if (ids_lst[v].toString() == name.toString()) {
      ret = v.replace('block.minecraft.', '').replace('item.minecraft.', '')
    }
  })
  return ret
}