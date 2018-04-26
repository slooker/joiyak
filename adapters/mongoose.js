'use strict';

module.exports = {
  toMongoose: joiSchema => {
    const json = joiSchema.describe()
    const fields = json.children
    let mongooseSchema = {}
    const keys = Object.keys(fields)

    keys.forEach(key => { const props = fields[key]
      const schema = pickProperType(props, key)
      mongooseSchema = Object.assign({}, mongooseSchema, {[key]: schema})
    })
    console.log('mongooseschema: ', mongooseSchema)
    return mongooseSchema
  },
}

function pickProperType(props, key) {
  // Loop over Joi data types
  switch (props.type) {
    case 'array':
      const { items } = props
      const arrayItems = []
      items.forEach(item => {
        Object.keys(item.children).forEach(childKey => {
          const child = pickProperType(item.children[childKey], childKey)
          arrayItems.push({ [childKey]: child })
        })
      })
      return arrayItems
      break
    case 'string':
      const stringSchema = {
        type: props.type,
        required: props.flags ? !!props.flags.presence : false,
        ...processJoiRules(props, key),
      }
      if (props.valids) {
        stringSchema.enum = props.valids
      }
      return stringSchema
      break
    case 'boolean':
      const booleanSchema = {
        type: props.type,
        required: props.flags ? !!props.flags.presence : false,
        ...processJoiRules(props, key),
      }
      return booleanSchema
      break
    case 'number':
      const numberSchema = {
        type: props.type,
        required: props.flags ? !!props.flags.presence : false,
        ...processJoiRules(props, key),
      }
      return numberSchema
      break
    case 'date':
      break
    default:
  }
}

//   string: (props, key) => {
//   },
// }

function processJoiRules(props, key) {
  const schema = {}
  if (props.rules) {
    for (const rule of props.rules) {
      switch (rule.name) {
        case 'precision': // Only for numbers
          schema.match = new RegExp(`^\\d+(\\.\\d{0,${rule.arg}})?$`)
          break
        case 'min':
          if (props.type === 'string') {
            schema.minlength = rule.arg
          } else if (props.type === 'number' && props.name !== 'precision') {
            schema.min = rule.arg
          }
          break
        case 'max':
          if (props.type === 'string') {
            schema.maxlength = rule.arg
          } else if (props.type === 'number') {
            schema.max = rule.arg
          }
          break
        case 'email':
          schema.match = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
          break
        case 'alphanum':
          schema.match = new RegExp('^[A-Za-z0-9]+$')
          break
        default:
      }
    }
    return schema
  }
}