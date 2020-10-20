import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
  image_name: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
})

const imageModel = mongoose.model('image', imageSchema)

export default imageModel