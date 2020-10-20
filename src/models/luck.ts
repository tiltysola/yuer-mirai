import mongoose from 'mongoose'

const luckSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true
  },
  num: {
    type: Number,
    required: true
  },
  time: {
    type: String,
    required: true,
    default: 0
  }
})

const luckModel = mongoose.model('luck', luckSchema)

export default luckModel