import request from 'request'
import md5 from 'md5'

import {send_private_msg, send_group_msg} from '../commands/CQReply'

import secret from '../configs/secret'

export const TencentAI_Private = function (ws: any, user_id: any, args: any) {
  // console.log(args)
}

export const TencentAI_Group = function (ws: any, user_id: any, group_id: any, args: any) {
  // 自定义 调用TencentAI的API
  if (args.includes('[CQ:at,qq=2152002367]')) {
    console.log('[Debug]', 'Receive command: TencentAI, User_ID:', user_id, ': Group_ID:', group_id, ': Msg:', args)
    // 处理消息
    const msg = args
    for (let i = msg.length - 1; i >= 0; i--) {
      if (!msg[i]) continue
      if (msg[i].search(/\[CQ(.+?)]/g) == 0) {
        msg.splice(i, 1)
      }
    }
    let msgStr = null
    if (msg.length > 0) {
      msgStr = msg.join(' ')
    }
    if (msg.length > 0) {
      const url = 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat'
      const params = {
        session: user_id.toString(),
        question: msgStr
      }
      request({
        url,
        method: 'post',
        json: true,
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        form: sign(params, secret.tencentai.appid, secret.tencentai.secret)
      }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
          // let content = body.content.replace(/{br}/g, '\n')
          if (body.ret == 0) {
            send_group_msg(ws, group_id, body.data.answer)
          } else {
            send_group_msg(ws, group_id, body.msg)
          }
        }
      })
    }
  }

  function createNonceStr () {
    return Math.random()
      .toString(36)
      .substr(2, 15)
  }

  function createTimestamp (): number {
    return parseInt((new Date().getTime() / 1000).toString(), 0)
  }

  function sign (params: any, appId: number, appKey: string) {
    const ret = {
      ...{
        app_id: appId,
        nonce_str: createNonceStr(),
        time_stamp: createTimestamp(),
      },
      ...params,
    };
    let str = raw(ret)
    str += "&" + "app_key=" + appKey
    const md5Sign = md5(str)
      .toString()
      .toUpperCase()
    ret.sign = md5Sign
    return ret
  }

  function raw (args: any): string {
    let keys = Object.keys(args)
    keys = keys.sort();
    const newArgs: any = {}
    keys.forEach((key) => {
      newArgs[key] = args[key]
    });
  
    let str = ""
    for (const k in newArgs) {
      if (k) {
        str += "&" + k + "=" + encode(newArgs[k])
      }
    }
    str = str.substr(1)
    return str
  }

  function encode(str: string) {
    str = encodeURI(str)
    str = str.toString().replace(/\+/g, '%2B')
    str = str.toString().replace(/\@/g, '%40')
    str = str.toString().replace(/\*/g, '%2A')
    str = str.toString().replace(/\//g, '%2F')
    str = str.toString().replace(/\!/g, '%21')
    str = str.toString().replace(/\#/g, '%23')
    str = str.toString().replace(/\$/g, '%24')
    str = str.toString().replace(/\&/g, '%26')
    str = str.toString().replace(/\(/g, '%28')
    str = str.toString().replace(/\)/g, '%29')
    str = str.toString().replace(/\=/g, '%3D')
    str = str.toString().replace(/\:/g, '%3A')
    str = str.toString().replace(/\;/g, '%3B')
    str = str.toString().replace(/\'/g, '%27')
    str = str.toString().replace(/\?/g, '%3F')
    str = str.toString().replace(/\~/g, '%7E')
    str = str.toString().replace(/\%20/g, '+')
    return str
  }
}