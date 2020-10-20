import express from 'express'
import Bot from '../models/bot'

import {send_private_msg, send_group_msg} from '../commands/CQReply'
import { TTGet } from '../handlers/TTHandle'

const router = express.Router()

// Main page
router.post('/*', (req, res) => {
  try {
    let token = req.url.split('?access_token=')[1]
    let user_id = req.url.split('/')[1]
    let process_type = req.url.split('?')[0].split('/')[2]
    Bot.findOne({ user_id }, (err, res: any) => {
      if (err) {
        console.log('[Error]', err)
      } else {
        if (res && res.use_tata && res.tata_access == token) {
          if (process_type === 'send_private_msg' || process_type === 'send_private_msg_async') {
            let ws = TTGet(user_id)
            if (ws) {
              send_private_msg(ws, req.body.user_id, req.body.message)
            }
          } else if (process_type === 'send_group_msg' || process_type === 'send_group_msg_async') {
            let ws = TTGet(user_id)
            if (ws) {
              send_group_msg(ws, req.body.group_id, req.body.message)
            }
          }
        }
      }
    })
    res.send('{code: 200}')
  } catch (e) {
    res.send('{code: 500}')
  }
})

module.exports = router