'use strict'

const assert = require('assert')
const should = require('should')
const Joi = require('joi')
const Joiyak = require('../index')
const mongoose = require('mongoose')

const joiSchema = Joi.object().keys({
  // username: Joi.string().alphanum().min(3).max(30).required(),
  // fullname: Joi.string().min(3).max(30).required(),
  // email: Joi.string().email(),
  // ownedItemCount: Joi.number().integer().min(0).max(10),
  // dollars: Joi.number().precision(2),
  floatNumber: Joi.number().precision(5),
  // ownsThings: Joi.array().items(Joi.object({ body: Joi.string(), date: Joi.date() })),
  // type: Joi.string().valid('start', 'stop', 'setTime'),
})
const User = mongoose.model('User', Joiyak.toMongoose(joiSchema))

describe('mongoose', () => {
  it('should validate required fields', () => {
    const firstUser = new User({
      username: 'Shawn',
      fullname: 'shawn looker',
    })
    const firstUserError = firstUser.validateSync()
    should.not.exist(firstUserError)

    const secondUser = new User({
      username: 'Shawn'
    })
    const secondUserError = secondUser.validateSync()
    secondUserError.errors.fullname.properties.type.should.equal('required')
    secondUserError.name.should.equal('ValidationError')
  })

  it('should validate min max for strings', () => {
    const firstUser = new User({
      username: 'Sh',
      fullname: 'shawn looker'
    })
    const firstUserError = firstUser.validateSync()
    firstUserError.name.should.equal('ValidationError')
    firstUserError.errors.username.properties.type.should.equal('minlength')

    const secondUser = new User({
      username: 'ShawnLookerThisIsMySuperLongUserName',
      fullname: 'shawn looker',
    })
    const secondUserError = secondUser.validateSync()
    secondUserError.errors.username.properties.type.should.equal('maxlength')
    secondUserError.name.should.equal('ValidationError')
  })

  it('should validate min/max for numbers', () => {
    const firstUser = new User({
      username: 'Shawn',
      fullname: 'shawn looker',
      ownedItemCount: -5
    })
    const firstUserError = firstUser.validateSync()
    firstUserError.name.should.equal('ValidationError')
    firstUserError.errors.ownedItemCount.properties.type.should.equal('min')

    const secondUser = new User({
      username: 'ShawnLookerThisIsMySuperLongUserName',
      fullname: 'shawn looker',
      ownedItemCount: 9001
    })
    const secondUserError = secondUser.validateSync()
    secondUserError.errors.ownedItemCount.properties.type.should.equal('max')
    secondUserError.name.should.equal('ValidationError')
  })

  it.only('should validate precision numbers', () => {
    const firstUser = new User({
      username: 'Shawn',
      fullname: 'shawn looker',
      floatNumber: 1.0
    })
    const firstUserError = firstUser.validateSync()
    should.not.exist(firstUserError)

    const secondUser = new User({
      username: 'Shawn',
      fullname: 'shawn looker',
      floatNumber: 1.2345678
    })

    console.log('Regex test is passing: ', new RegExp('^\d+(\.\d{0,5})?$').test(1.23456789))

    const secondUserError = secondUser.validateSync()
    console.log('second user error: ', secondUserError)
    secondUserError.errors.floatNumber.properties.type.should.equal('user defined')
    secondUserError.name.should.equal('ValidationError')
  })
})