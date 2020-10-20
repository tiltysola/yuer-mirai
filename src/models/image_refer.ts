import mongoose from 'mongoose'

const image_referSchema = new mongoose.Schema({
  category: {
    type: String,
    unique: true,
    required: true
  },
  refer: {
    type: Array,
    required: true,
    default: []
  }
})

const image_referModel = mongoose.model('image_refer', image_referSchema)

export default image_referModel