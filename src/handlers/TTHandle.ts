import Crypto from 'crypto'
import request from 'request'

let AvaTT: any = []

export const TTAdd = function (user_id: any, ws: any) {
  AvaTT[user_id] = ws
}

export const TTGet = function (user_id: any) {
  return AvaTT[user_id]
}

export const TTHandle = function (msg: any, url: any, access: any, user_id: any) {
  msg = JSON.stringify(msg)
  let hmac = Crypto.createHmac('sha1', access)
  let sign = hmac.update(msg).digest('hex')
  request({
    url,
    method: 'post',
    headers: {
      'X-Self-ID': user_id,
      'X-Signature': 'sha1=' + sign
    },
    body: msg
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      console.log('[Debug]', body)
    } else {
      console.log('[Error]', err, url, access, user_id)
    }
  })
}