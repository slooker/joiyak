'use strict'

const Sequelize = require('sequelize')
const Mongoose = require('./adapters/mongoose')

module.exports = {
  toMongoose: Mongoose.toMongoose,
}

