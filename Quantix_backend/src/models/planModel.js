let mongoose = require('mongoose')

let planSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, default: null },
    planName: { type: String, default: null },
    planAddress: { type: String, default: null },
    imageUrl: { type: String, default: null },
    status: { type: Boolean, default: false }

}, { timestamps: true })

let planModel = mongoose.model("plan",planSchema)
module.exports = planModel
