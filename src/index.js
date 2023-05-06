const express = require('express');
const app = express();
const path = require('path');
const POST = 8080;
const { json } = require('body-parser');
const moment = require('moment');

const { ReportModel } = require('./db/model/report.js');

const { getQuestions, stressAnalyze } = require('./utils.js');
app.use(express.static(path.join(process.cwd(), './public')));

app.listen(POST, () => {
  console.log(`listening in ${POST}`);
});

app.use(json());

app.use((req, res, next) => {
  res.setHeader('content-type', 'application/json;charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/questions.json', (req, res) => {
  res.send({
    success: true,
    data: getQuestions(),
  });
});

app.post('/submit_daily.json', async (req, res) => {
  if (!!(await ReportModel.isTodaySubmitted()).length) {
    res.send({
      success: false,
      errorMsg: '今日已经提交过了！',
    });
    return;
  }

  try {
    const [stress, detailData] = stressAnalyze(req.body);

    const report = new ReportModel({
      date: new Date(),
      data: detailData,
      stress: stress,
      avg22: await ReportModel.getAvg(22),
    });

    console.log(report);

    // await report.save();

    res.send({
      success: true,
      data: {
        stress: stress,
      },
    });
  } catch (error) {
    res.send({
      success: false,
      errorMsg: error.message,
    });
  }
});

app.get('/is_today_submitted.json', async (req, res) => {
  const isTodaySubmitted = !!(await (
    await ReportModel.isTodaySubmitted()
  ).length);
  res.send({
    success: true,
    data: isTodaySubmitted,
  });
});

app.get('/report.json', async (req, res) => {
  const { date_range: date_range_string, limited = 100 } = req.query;

  const toDay = new Date();

  const date_range = date_range_string
    ? JSON.parse(date_range_string)
    : [
        '2023-1-1',
        `${toDay.getFullYear()}-${toDay.getMonth() + 1}-${toDay.getDate()}`,
      ];

  const date_validator = /^\d{4}-\d{1,2}-\d{1,2}$/;

  if (
    !date_validator.test(date_range[0] || !date_validator.test(date_range[1]))
  ) {
    res.send({
      success: false,
      errorMsg: '日期格式错误，应为 YYYY-MM-DD',
    });
    return;
  }

  if (date_range.length !== 2 || date_range[0] > date_range[1]) {
    res.send({
      success: false,
      errorMsg: '日期范围错误！',
    });
    return;
  }

  res.send({
    success: true,
    data: await ReportModel.getReport(date_range[0], date_range[1], limited),
  });
});

app.get('/test_data', async (req, res) => {
  const arr = Array(200).fill(0);

  for await (const [index, item] of arr.entries()) {
    const date = moment()
      .add(-(index + 1), 'day')
      .toDate();
    const report = new ReportModel({
      date: date,
      stress: Math.floor(Math.random() * 10000) / 10000,
      avg22: Math.floor(Math.random() * 10000) / 10000,
    });
    await report.save();
  }
  res.send({
    success: true,
  });
});
