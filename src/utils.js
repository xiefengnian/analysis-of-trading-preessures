const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const md5 = require('md5');

const TMP_DIR = path.join(process.cwd(), 'tmp');
const TMP_QUESTIONS_PATH = path.join(TMP_DIR, 'questions.json');

const getQuestionsFile = () => {
  return fs.readFileSync(path.join(__dirname, './questions.json'), 'utf-8');
};

const getStructuredQuestions = () => {
  const questionsFile = getQuestionsFile();

  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
  if (fs.existsSync(TMP_QUESTIONS_PATH)) {
    const nativeId = JSON.parse(
      fs.readFileSync(TMP_QUESTIONS_PATH, 'utf-8')
    ).nId;
    if (nativeId === md5(questionsFile)) {
      return JSON.parse(fs.readFileSync(TMP_QUESTIONS_PATH, 'utf-8')).questions;
    }
  }
  const questions = JSON.parse(questionsFile)['questions'];
  const newQuestions = questions.map((questionItem) => {
    return {
      id: uuid.v1(),
      ...questionItem,
    };
  });
  fs.writeFileSync(
    TMP_QUESTIONS_PATH,
    JSON.stringify(
      {
        questions: newQuestions,
        nId: md5(questionsFile),
      },
      undefined,
      2
    )
  );
  return newQuestions;
};

const getQuestions = () => {
  return getStructuredQuestions();
};

const stressAnalyze = (reportData) => {
  const questions = JSON.parse(fs.readFileSync(TMP_QUESTIONS_PATH, 'utf-8'))[
    'questions'
  ];

  // 检查一下完整性
  if (questions.length !== reportData.length) {
    throw new Error('上报数据长度错误，请重试！');
  }

  questions.forEach(({ id }) => {
    if (reportData.find((item) => item.id === id) === undefined) {
      throw new Error('未完成问卷，请重试！');
    }
  });

  let total = 0;
  let score = 0;

  const combineData = questions.map((question) => {
    const { id, weight, title } = question;
    const { value } = reportData.find((item) => item.id === id);
    total += weight * 5;
    score += weight * value;
    return {
      id,
      value,
      weight,
      title,
    };
  });

  return [score / total, combineData];
};

module.exports = {
  getQuestions,
  stressAnalyze,
};
