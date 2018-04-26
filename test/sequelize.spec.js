// 'use strict'

// const assert = require('assert')
// const should = require('should')
// const Joi = require('joi')
// const Joiyak = require('../index')
// const mongoose = require('mongoose')

// const joiSchema = Joi.object().keys({
//   username: Joi.string().alphanum().min(3).max(30).required(),
//   fullname: Joi.string().min(3).max(30).required(),
//   email: Joi.string().email(),
//   ownedItemCount: Joi.number().integer().min(0).max(10),
//   dollars: Joi.number().precision(2),
//   floatNumber: Joi.number().precision(5),
//   ownsThings: Joi.array().items(Joi.object({ body: Joi.string(), date: Joi.date() })),
//   type: Joi.string().valid('start', 'stop', 'setTime'),
// })

// describe('sequelize', () => {

//   it.only('should output a valid schema', () => {
//     const sequelizeSchema = Joiyak.toSequelize(joiSchema)
//     console.log(sequelizeSchema)
//   })
// })