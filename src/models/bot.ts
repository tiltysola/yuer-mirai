import mongoose from 'mongoose'

const botSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true
  },
  use_private: {
    type: Boolean,
    required: true,
    default: false
  },
  use_group: {
    type: Boolean,
    required: true,
    default: false
  },
  allow_groups: {
    type: Array,
    required: true,
    default: ['*']
  },
  ban_groups: {
    type: Array,
    required: true,
    default: []
  },
  token: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: false
  },
  // Mirai dont need version anymore
  version: {
    type: String,
    required: false
  },
  online: {
    type: String,
    required: true,
    default: 0
  },
  use_tata: {
    type: Boolean,
    required: true,
    default: false
  },
  tata_url: {
    type: String,
    required: false
  },
  tata_access: {
    type: String,
    required: false
  }
})

const botModel = mongoose.model('bot', botSchema)

export default botModel