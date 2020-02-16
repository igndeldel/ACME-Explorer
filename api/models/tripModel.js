'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const generate = require('nanoid/generate');
const dateFormat = require('dateformat');

var StageSchema = new Schema({
    title: {
        type: String,
        required: 'Kindly enter the stage title'
    },
    description: {
        type: String,
        required: 'Kindly enter the stage description'
    },
    price: {
        type: Number,
        required: 'Kindly enter the stage price'
    }
});

var TripSchema = new Schema({
    ticker: {
      type: String,
      unique: true,
      //This validation does not run after middleware pre-save
      validate: {
        validator: function(v) {
            return /\d{6}-\w{4}/.test(v);
        },
        message: 'Trip ticker is not valid!, Pattern("\d(6)-\w(4)")'
      }
    },
    title: {
        type: String,
        required: 'Kindly enter the trip title'
    },
    description: {
        type: String,
        required: 'Kindly enter the trip description'
    },
    //TODO: Cálculo del full_price también al hacer el PUT
    full_price: {
        type: Number
    },
    requirements: {
        type: [String], 
        required: 'Kindly enter the trip requirements'
    },
    date_start: {
        type: Date,
        required: 'Kindly enter the trip date_start'
    },
    date_end: {
        type: Date,
        required: 'Kindly enter the trip date_end'
    },
    pictures: {
        data: Buffer, 
        contentType: String
    },
    canceled: {
        type: Boolean,
        default: false
    },
    reason: {
        type: String,
        required: [
            function() { return (this.canceled && this.reason==undefined) || (this.canceled && this.reason===""); },
            'The reason is required if trip is canceled'
        ]
    },
    stages: [StageSchema]
}, { strict: false, timestamps: true });

// Execute before each item.save() call
TripSchema.pre('save', function(callback) {

    //Cálculo del ticker
    var new_trip = this;
    var day=dateFormat(new Date(), "yymmdd");
    var generated_ticker = [day, generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)].join('-')
    new_trip.ticker = generated_ticker;

    //Cálculo del precio total de Trip a partir de sus Stages
    var full_price=0;
    new_trip.stages.forEach(stage => {
        full_price=stage.price;
    });
    new_trip.full_price=full_price;
    callback();
  });

module.exports = mongoose.model('Trips', TripSchema);
module.exports = mongoose.model('Stages', StageSchema);