var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	to: {type: String, require: true},
	text: {type: String, require: true},
	subject: {type: String, require: true}
});

module.exports = mongoose.model('Message', schema);