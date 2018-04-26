'use strict';

module.exports = {
  toSequelize: joiSchema => {
    const json = joiSchema.describe()
    const fields = json.children
    const sequelizeSchema = {}
    const keys = Object.keys(fields)

    keys.forEach(key => {
      const props = fields[key]
      if (props.type === 'array') {
        const { items } = props
        const arrayItems = []
        items.forEach(item => {
          Object.keys(item.children).forEach(childKey => {
            const child = processSequelizeKey(item.children[childKey])
            arrayItems.push({ [childKey]: child })
          })
        })
        sequelizeSchema[key] = arrayItems
      } else {
        sequelizeSchema[key] = processSequelizeKey(props)
      }
    })
    // console.log('mongooseschema: ', sequelizeSchema)
    return sequelizeSchema
  },
}

function processSequelizeKey(props) {
  let schema = processSequelizeRules(props)

  if (props.flags && props.flags.presence) {
    schema.validate = Object.assign({}, schema.validate, { notEmpty: true, notNull: true})
  }
  if (props.valids) {
    schema.validate = Object.assign({}, schema.validate, { isIn: [props.valids]})
  }
  return schema
}

function processSequelizeRules(props) {
  const schema = {}
  console.log('type: ', props.type)
  switch (props.type) {
    case 'string':
      schema.type = Sequelize.STRING
      break
    case 'date':
      schema.type = Sequelize.DATE
      break
    case 'number':
      schema.type = Sequelize.INTEGER
      break
    case 'boolean':
      schema.type = Sequelize.BOOLEAN
      break
    default:
  }
  if (props.rules) {
    schema.validate = {}
    for (const rule of props.rules) {
      switch (rule.name) {
        case 'precision':
          schema.validate.is = new RegExp(`^\\d+(\\.\\d{0,${rule.arg}})?$`)
          break
        case 'min':
          if (props.type === 'string') {
            schema.validate.minLength = rule.arg
          } else if (props.type === 'number') {
            schema.validate.min = rule.arg
          }
          break
        case 'max':
          if (props.type === 'string') {
            schema.validate.maxLength = rule.arg
          } else if (props.type === 'number') {
            schema.validate.max = rule.arg
          }
          break
        case 'email':
          schema.validate.is = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
          break
        case 'alphanum':
          schema.validate.is = new RegExp('^[A-Za-z0-9]+$')
          break
        default:
      }
    }
    if (schema.validate.minLength && schema.validate.maxLength) {
      schema.validate.len = [schema.validate.minLength, schema.validate.maxLength]
      delete schema.validate.maxLength
      delete schema.validate.minLength
    } else if (schema.validate.maxLength) {
      schema.validate.len = [0, schema.validate.maxLength]
      delete schema.validate.maxLength
    }
    return schema
  }
}