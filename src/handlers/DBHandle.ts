import mongoose from 'mongoose'

import config from '../configs/config'

const DBHandle = new Promise((resolve, reject) => {
  const db_engine = config.db_engine
  const db_info = config.db_info
  if (db_engine === 'mongo') {
    mongoose.connect('mongodb://' + db_info.host + ':' + db_info.port + '/xivbot', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    mongoose.connection.once('open', err => {
      if (!err) {
        console.log('[Debug]', 'Database connected.')
        resolve()
      } else {
        console.log('[Error]', err)
        reject(err)
      }
    })
  } else {
    console.log('[Error]', 'Can not find db_engine in config.ts')
    reject('Engine not found')
  }
})

export default DBHandle