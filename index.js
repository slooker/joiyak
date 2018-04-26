'use strict'

const joiSchema

const Adapter = (orm, mapper) => ({
  getSchema: () => {
    return mapper(orm, joiSchema)
  }
})

const Joyak = joiSchema => {
  const adapters = {}

  const setAdapter = (adapterName, orm, mapper) => {
    if (! (adapterName in adapters)) {
      Joyak.adapters[adapterName] = Adapter(orm, () => mapper(orm, joiSchema))
    } else {
      throw Error('Adapter was already registered')
    }
  }

  const getAdapter = adapterName => {
    if (adapterName in adapters) {
      return adapters[adaptersName]
    }
    }

    throw Error('Adapter was not registered')
  }

  return {
    adapters, setAdapter, getAdapter,
  }
}

const Joyak = {
  adapters: {},
  setAdapter,
  getAdapter(adapterName) {
    return Joyak.adapters[adapterName]
  }
}


Joyak.setAdapter('mongoose', require('mongoose'), (orm, joiSchema) => {
  const json = joiSchema.describe()
  const fields = json.children
  const mongooseSchema = {}
  const keys = Object.keys(fields)

  keys.forEach(key => {
  const props = fields[key]
  if (props.type === 'array') {
    const { items } = props
    const arrayItems = []
    items.forEach(item => {
      Object.keys(item.children).forEach(childKey => {
        const child = processJoiKey(item.children[childKey], childKey)
        arrayItems.push({ [childKey]: child })
      })
    })
    mongooseSchema[key] = arrayItems
  } else {
    mongooseSchema[key] = processJoiKey(props, key)
  }
  })
  // console.log('mongooseschema: ', mongooseSchema)
  return mongooseSchema
})

Joyak.setAdapter('sequelize', require('seuqelize'), (orm, joiSchema) => {
  return {
    
  }
})

// TODO: What if we could provide a common interface to describe our schemas, and then in the background the adapter could map our common interface schema into Joi's, and then hook it up with 
// whatever ORM we are using with the adapter


module.exports = {
  toMongoose: joiSchema => {
    const json = joiSchema.describe()
    const fields = json.children
    const mongooseSchema = {}
    const keys = Object.keys(fields)

    keys.forEach(key => {
      const props = fields[key]
      if (props.type === 'array') {
        const { items } = props
        const arrayItems = []
        items.forEach(item => {
          Object.keys(item.children).forEach(childKey => {
            const child = processJoiKey(item.children[childKey], childKey)
            arrayItems.push({ [childKey]: child })
          })
        })
        mongooseSchema[key] = arrayItems
      } else {
        mongooseSchema[key] = processJoiKey(props, key)
      }
    })
    // console.log('mongooseschema: ', mongooseSchema)
    return mongooseSchema
  },

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
  const schema = {
    type: props.type,
    required: props.flags ? !! props.flags.presence : false,
    ...processSequelizeRules(props),
  }
  if (props.valids) {
    schema.enum = props.valids
  }
  return schema
}

function processSequelizeRules(props) {
  const schema = {}
  if (props.rules) {
    for (const rule of props.rules) {
      switch (rule.name) {
        case 'min':
          if (props.type === 'string') {
            schema.minlength = rule.arg
          } else if (props.type === 'number') {
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
        case 'alphanum':
          schema.match = new RegExp('^[A-Za-z0-9]+$')
          break
        default:
      }
    }
    return schema
  }
}

function processJoiKey(props, key) {
  const schema = {
    type: props.type,
    required: props.flags ? !! props.flags.presence : false,
    ...processJoiRules(props, key),
  }
  if (props.valids) {
    schema.enum = props.valids
  }
  return schema
}

function processJoiRules(props, key) {
  const schema = {}
  if (props.rules) {
    for (const rule of props.rules) {
      switch (rule.name) {
        case 'precision':
          schema.validate = function(number) {
            const regex = new RegExp(`^\\d+(\\.\\d{0,${rule.arg}})?$`)
            return regex.test(number)
          }
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
        case 'alphanum':
          schema.match = new RegExp('^[A-Za-z0-9]+$')
          break
        default:
      }
    }
    return schema
  }
}
