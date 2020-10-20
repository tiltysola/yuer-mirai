import * as W from './weather/weather'
import langs from './weather/zh_CN'
import moment from 'moment'

import {send_private_msg, send_group_msg} from './CQReply'

export const Weather_Private = function (ws: any, user_id: any, location: any) {
  console.log('[Debug]', 'Receive command: Weather, User_ID:', user_id, ': Location:', location)
  weather(location, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Weather_Group = function (ws: any, group_id: any, location: any) {
  console.log('[Debug]', 'Receive command: Weather, Group_ID:', group_id, ': Location:', location)
  weather(location, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function weather (location: any, callback: any) {
  if (!location) {
    callback('查询天气：!weather <地图名|中文>')
  } else {
    // W.init()
    let found = false
    let lang_arr: any = Object.keys(langs)
    for (let i = 0; i < lang_arr.length; i++) {
      if (location === langs[lang_arr[i]]) {
        found = true
        let matches = W.find({
          zone: lang_arr[i],
          desiredWeathers: [],
          previousWeathers: [],
          beginHour: 0,
          endHour: 23
        })
        matches.map(x => x()).map((x, i) => {
          let reply = location + '地图天气如下：'
          for (let i = 1; i < 9; i++) {
            let EUnix = getEorzeaUnix(x.begin.getTime()) + i * 3600000 * 8
            reply += ('\n' + langs[x.weathers[i]] + ' -> ' + langs[x.weathers[i + 1]] + '   ET ' + getET(EUnix))
            if (Math.floor((getUniversalUnix(EUnix) - new Date().getTime()) / 60 / 1000) >= 0) {
              reply += (' 距离约：' + Math.floor((getUniversalUnix(EUnix) - new Date().getTime()) / 60 / 1000) + '分钟')
            }
          }
          reply += ('\n----------------')
          reply += ('\n当前天气： ' + langs[x.weathers[1]])
          reply += ('\n当前时间： ET ' + getET(getEorzeaUnix(new Date().getTime())))
          callback(reply)
        })
      }
    }
    if (!found) {
      callback('没有找到指定地图的天气信息。')
    }
  }
}

let getEorzeaUnix = function (universalTime: any) {
  let eorzeaMultipler = (3600 / 175)
  return universalTime * eorzeaMultipler
}
let getUniversalUnix = function (eorzeaTime: any) {
  let eorzeaMultipler = (3600 / 175)
  return eorzeaTime / eorzeaMultipler
}
let getEorzeaUTC = function (eorzeaUnix: any) {
  let result = moment.utc(eorzeaUnix)
  return result.format('HH:mm')
}
let getCalender = function (fmt: string, eorzeaUnix: number) {
  let days = Math.floor(eorzeaUnix / 1000 / 86400)
  let ret
  let opt: any = {
    'Y+': Math.floor(days / 32 / 12).toString(),
    'm+': Math.floor(days / 32 % 12).toString(),
    'd+': Math.floor(days % 32 + 1).toString()
  }
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}
let getET = function (x: any) {
  return getCalender('mm-dd', x) + ' ' + getEorzeaUTC(x)
}