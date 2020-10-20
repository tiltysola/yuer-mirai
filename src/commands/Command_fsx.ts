import {send_private_msg, send_group_msg} from './CQReply'

export const Fsx_Private = function (ws: any, user_id: any, type: any, value: any) {
  console.log('[Debug]', 'Receive command: Fsx, User_ID:', user_id)
  send_private_msg(ws, user_id, fsx(type, value))
}

export const Fsx_Group = function (ws: any, group_id: any, type: any, value: any) {
  console.log('[Debug]', 'Receive command: Fsx, Group_ID:', group_id)
  send_group_msg(ws, group_id, fsx(type, value))
}

function fsx (type: any, value: any) {
  let version = '版本 5.0 Lv80 等级基数: 3300'
  let base = 3300
  if (!type || !value) {
    return '副属性计算：!fsx <暴击|直击|等> <数值>'
  }
  value = parseInt(value)
  if (value < 0 || value > 99999) {
    return '数值输入有误，请检查。'
  }
  if (type === '暴击' || type === '暴') {
    let msg = ''
    let perc: any = (5 + (value - 380) / base * 20).toFixed(1)
    let perv: any = (140 + (value - 380) / base * 20).toFixed(1)
    if (perc < 0) perc = 0
    if (perv < 0) perv = 0
    msg += ('暴击 ' + value + ' 的计算结果: [基数: 380]')
    msg += ('\n暴击率:      ' + perc + '%')
    msg += ('\n暴击伤害:   ' + perv + '%')
    msg += ('\n预期收益:   ' + (perc * perv / 10000 + (1 - perc / 100)).toFixed(3))
    msg += ('\n版本 5.0 Lv80 等级基数: 3300')
    return msg
  } else if (type === '直击' || type === '直') {
    let msg = ''
    let perc: any = ((value - 380) / base * 55).toFixed(1)
    if (perc < 0) perc = 0
    msg += ('直击 ' + value + ' 的计算结果: [基数: 380]')
    msg += ('\n直击率:      ' + perc + '%')
    msg += ('\n直击伤害:   125%')
    msg += ('\n预期收益:   ' + (perc * 125 / 10000 + (1 - perc / 100)).toFixed(3))
    msg += ('\n版本 5.0 Lv80 等级基数: 3300')
    return msg
  } else if (type === '信念' || type === '信') {
    let msg = ''
    let perc: any = ((value - 340) / base * 13).toFixed(1)
    if (perc < 0) perc = 0
    msg += ('信念 ' + value + ' 的计算结果: [基数: 340]')
    msg += ('\n伤害增益:   ' + perc + '%')
    msg += ('\n版本 5.0 Lv80 等级基数: 3300')
    return msg
  } else if (type === '坚韧' || type === '韧') {
    let msg = ''
    let perc: any = ((value - 380) / base * 10).toFixed(1)
    if (perc < 0) perc = 0  
    msg += ('坚韧 ' + value + ' 的计算结果: [基数: 380]')
    msg += ('\n伤害增益:   ' + perc + '% [仅防护职业]')
    msg += ('\n受击伤害:   ' + (100 - perc) + '%')
    msg += ('\n版本 5.0 Lv80 等级基数: 3300')
    return msg
  } else if (type === '信仰') {
    let msg = ''
    let perc: any = (200 + (value - 340) / 22).toFixed(1)
    if (perc < 0) perc = 0  
    msg += ('信仰 ' + value + ' 的计算结果: [基数: 340]')
    msg += ('\n每3S魔法回复:   ' + perc + ' [战斗中]')
    msg += ('\n版本 5.0 Lv80 等级基数: 3300')
    return msg
  } else if (type === '咏唱速度' || type === '咏速' || type === '速') {
    let msg = ''
    let perc: any = ((value - 380) / base * 13).toFixed(1)
    if (perc < 0) perc = 0  
    msg += ('咏速 ' + value + ' 的计算结果: [基数: 380]')
    msg += ('\n咏唱加快:   ' + perc + '% [DoT增益]')
    msg += ('\n复唱:      ' + (2.5 * (1 - perc / 100)).toFixed(2) + 's')
    msg += ('\n1.5s:      ' + (1.5 * (1 - perc / 100)).toFixed(2) + 's')
    msg += ('\n2.0s:      ' + (2.0 * (1 - perc / 100)).toFixed(2) + 's')
    msg += ('\n2.8s:      ' + (2.8 * (1 - perc / 100)).toFixed(2) + 's')
    msg += ('\n3.0s:      ' + (3.0 * (1 - perc / 100)).toFixed(2) + 's')
    msg += ('\n复活:      ' + (8.0 * (1 - perc / 100)).toFixed(2) + 's [默认8秒]')
    msg += ('\n版本 5.0 Lv80 等级基数: 3300')
    return msg
  }
}