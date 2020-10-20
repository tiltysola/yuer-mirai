import {send_private_msg, send_group_msg} from './CQReply'

import skills from './blue/skills'

let skills_lst: any = skills()

export const Blue_Private = function (ws: any, user_id: any, arg: any) {
  console.log('[Debug]', 'Receive command: Help, User_ID:', user_id, ': arg:', arg)
  send_private_msg(ws, user_id, blue(arg))
}

export const Blue_Group = function (ws: any, group_id: any, arg: any) {
  console.log('[Debug]', 'Receive command: Blue, Group_ID:', group_id, ': arg:', arg)
  send_group_msg(ws, group_id, blue(arg))
}

function blue (arg: any) {
  if (!arg) {
    return '青魔法书：!blue <技能ID|技能名称|ALL>'
  }
  if (arg.toUpperCase() === 'ALL') {
    let msg = '青魔法师技能一览：'
    for (let i = 0; i < skills_lst.length; i++) {
      if (i % 4 === 0) {
        msg += '\n'
      } else {
        msg += '     '
      }
      msg += (skills_lst[i]['编号'] + '. ' + skills_lst[i]['终极针'])
    }
    return msg
  }
  let skill = null
  for (let i = 0; i < skills_lst.length; i++) {
    if (skills_lst[i]['编号'] === parseInt(arg) || skills_lst[i]['终极针'].search(arg) >= 0) {
      skill = skills_lst[i]
      break
    }
  }
  if (skill) {
    let msg = '★ 青魔法书技能 ' + skill['终极针'] + '(id: ' + skill['编号'] + ')' + ' 详情如下：'
    msg += ('\n★ 攻击类型：' + skill['类型'] + '   攻击属性：' + skill['属性'])
    msg += ('\n★ 稀有度：' + skill['稀有度'] + '   敌人等级：' + skill['敌人等级'])
    msg += ('\n★ 介绍：\n' + skill['技能效果'])
    msg += ('\n★ 获得方法：\n' + skill['获得方法'])
    return msg
  } else {
    return '月儿在青魔法书内没有找到这个技能哦！'
  }
}