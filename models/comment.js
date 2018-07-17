var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    createdAt: {type: Date, default: Date.now},
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    parentId: String,
    level: {type: Number, default: 0}
});

module.exports = mongoose.model("Comment", commentSchema);