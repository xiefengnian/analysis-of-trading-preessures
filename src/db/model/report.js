const mongoose = require('../mongodb');

const MODEL_NAME = 'Report';

const ReportSchema = new mongoose.Schema(
  {
    date: Date,
    data: [
      {
        title: String,
        value: Number,
        weight: Number,
      },
    ],
    stress: Number,
    avg22: Number,
  },
  {
    methods: {},
    statics: {
      isTodaySubmitted: function () {
        return this.find({
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        });
      },
      getAvg: async function (n) {
        const data = await this.find({}).limit(n).sort({ date: -1 }).exec();

        if (data.length < n) {
          return -1;
        }
        return data.reduce((acc, cur) => acc + cur.stress, 0) / n;
      },
      getReport: async function (from, to, limit) {
        const data = await this.find({
          date: {
            $gte: new Date(`${from} 0:0:0:0`),
            $lte: new Date(`${to} 23:59:59:999`),
          },
        })
          .limit(limit)
          .sort({ date: -1 })
          .exec();

        return data;
      },
    },
  }
);

const ReportModel = mongoose.model(MODEL_NAME, ReportSchema);

exports.ReportModel = ReportModel;
