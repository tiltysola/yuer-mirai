let reply: any = null
let reply_queue: any = []
let handling = false
let timeout: any = null

export const send_private_msg = function (ws: any, user_id: any, message: any) {
  if (ws) {
    reply_queue.push({
      ws,
      msg: {
        action: 'send_private_msg',
        params: {
          user_id,
          message
        }
      }
    })
    if (handling === false) {
      handling = true
      handleMsg()
    }
  }
}

export const send_private_msg_ping = function (ws: any, user_id: any, ping: any) {
  if (ws) {
    reply_queue.push({
      ws,
      msg: {
        action: 'send_private_msg',
        params: {
          user_id
        }
      },
      ping,
      user_id
    })
    if (handling === false) {
      handling = true
      handleMsg()
    }
  }
}

export const send_private_msg_wd = function (ws: any, user_id: any, message: any, wd: any) {
  if (ws) {
    reply_queue.push({
      ws,
      msg: {
        action: 'send_private_msg',
        params: {
          user_id,
          message
        }
      },
      withdraw: wd
    })
    if (handling === false) {
      handling = true
      handleMsg()
    }
  }
}

export const send_group_msg = function (ws: any, group_id: any, message: any) {
  if (ws) {
    reply_queue.push({
      ws,
      msg: {
        action: 'send_group_msg',
        params: {
          group_id,
          message
        }
      }
    })
    if (handling === false) {
      handling = true
      handleMsg()
    }
  }
}

export const send_group_msg_ping = function (ws: any, group_id: any, ping: any) {
  if (ws) {
    reply_queue.push({
      ws,
      msg: {
        action: 'send_group_msg',
        params: {
          group_id
        }
      },
      ping,
      group_id
    })
    if (handling === false) {
      handling = true
      handleMsg()
    }
  }
}

export const send_group_msg_wd = function (ws: any, group_id: any, message: any, wd: any) {
  if (ws) {
    reply_queue.push({
      ws,
      msg: {
        action: 'send_group_msg',
        params: {
          group_id,
          message
        }
      },
      withdraw: wd
    })
    if (handling === false) {
      handling = true
      handleMsg()
    }
  }
}

const handleMsg = function () {
  if (reply_queue.length > 0 && handling === true) {
    timeout = setTimeout(function () {
      handling = false
    }, 3000)
    reply = reply_queue.shift()
    if (reply.ping && reply.ping > 0) {
      reply.tmp_msg = '队列延迟：' + (new Date().getTime() - reply.ping) + '毫秒'
      reply.msg.params.message = '正在检测通讯延迟...'
    }
    reply.ws.send(JSON.stringify(reply.msg))
  } else {
    handling = false
  }
}

export const onMsg = function (ws: any, msg: any) {
  if (ws == reply.ws) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    if (reply.withdraw && reply.withdraw > 0) {
      setTimeout(function () {
        ws.send(JSON.stringify({
          action: 'delete_msg',
          params: {
            message_id: msg.data.message_id
          }
        }))
      }, reply.withdraw)
    }
    if (reply.ping && reply.ping > 0) {
      if (reply.msg.action === 'send_group_msg') {
        send_group_msg(ws, reply.group_id, reply.tmp_msg + '\n回执延迟：' + (new Date().getTime() - reply.ping) + '毫秒')
      } else if (reply.msg.action === 'send_private_msg') {
        send_private_msg(ws, reply.user_id, reply.tmp_msg + '\n回执延迟：' + (new Date().getTime() - reply.ping) + '毫秒')
      }
    }
    handleMsg()
  }
}