=== Intro ===
This project came about for a need to have a single schema that was ORM agnostic and could be used for validation.  After researching, we found a few solutions but they didn't seem to be getting maintained, and they were created and limited to a single ORM.  Thus we created Joiyak.  It takes in a standard [Joi](https://www.npmjs.com/package/joi) schema and will output the following formats:

- Mongoose

Yes, I know that's only one format.  We're working on others.  Give us some time!

=== Usage ===
```
const mongoose = require('mongoose')
const Joi = require('joi')
const JoiYak = require('joiyak')

const joiSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  fullname: Joi.string().min(3).max(30).required(),
  email: Joi.string().email(),
  ownedItemCount: Joi.number().min(0).max(10),
  ownsThings: Joi.array().items(Joi.object({ body: Joi.string(), date: Joi.date() })),
  type: Joi.string().valid('start', 'stop', 'setTime'),
})
const mongooseSchema = const userSchema = mongoose.Schema(JoiYak.toMongoose(joiSchema))
```

This will result in a mongoose schema that looks like this:
```
{
	username: {
		type: 'string',
		required: true,
		match: /^[A-Za-z0-9]+$/,
		minlength: 3,
		maxlength: 30
	},
	fullname: {
		type: 'string',
		required: true,
		minlength: 3,
		maxlength: 30
	},
	email: {
		type: 'string',
		required: false
	},
	ownedItemCount: {
		type: 'number',
		required: false,
		min: 0,
		max: 10
	},
	ownsThings: [{
		body: {
			type: "string",
			required: false
		}	}, {
		date: {
			type: "date",
			required: false
		}
	}],
	type: {
		type: 'string',
		required: false,
		enum: ['start', 'stop', 'setTime']
	}
}
```

=== Supports ===
- Supports min, max and precision settings for mongoose
- Supports enum
- Supports the types: number, date, array, string

=== TODO ===
- Add support for Sequelize
- Add validation for email
- Add float validation (precision in mongoose)
