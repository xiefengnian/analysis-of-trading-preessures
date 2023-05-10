import axios from 'axios';
import { useRequest } from 'ahooks';
import { Form, Radio, Card, Progress } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'antd/es/form/Form';
import { Canvas, Chart, Line, Axis, Tooltip, Point } from '@antv/f2';
import { Result } from 'antd';
import TextScroll from '@/components/TextScroll';

import IMAGE_1 from '../assets/闭嘴.png';
import IMAGE_2 from '../assets/惊吓.png';
import IMAGE_3 from '../assets/郁闷.png';
import IMAGE_4 from '../assets/愉快.png';
import { Divider } from 'antd';

const getStressState = (stress) => {
  if (stress < 0.4) {
    return [IMAGE_4, '保持低压状态更有利于在市场中获胜'];
  }
  if (stress < 0.6) {
    return [IMAGE_3, '稍微有点压力，注意饮食和休息'];
  }
  if (stress < 0.8) {
    return [IMAGE_2, '压力有点大，是不是最近的行情不适合你？建议减轻仓位'];
  }
  return [IMAGE_1, '压力过大！建议立即离开市场，重新思考交易策略'];
};

const FormItem = Form.Item;

const client = axios.create({
  baseURL: '/',
});

client.interceptors.response.use(
  (res) => {
    const { success, data, errorMsg } = res.data;
    if (success) return data;
    console.error(errorMsg);
  },
  (err) => {
    console.error(err.response?.data);
  }
);

export default function HomePage() {
  const { data: questions = [] } = useRequest(() =>
    client.get('/questions.json')
  );

  const { data: isTodaySubmitted } = useRequest(() =>
    client.get('/is_today_submitted.json')
  );

  const { runAsync: submitDaily } = useRequest(
    (data) => client.post('/submit_daily.json', data),
    {
      manual: true,
    }
  );

  const [activeQuestion, setActiveQuestion] = useState(0);

  const [finished, setFinished] = useState(false);

  const [form] = useForm();

  const [todayStress, setTodayStress] = useState(0);

  const chartCanvasRef = useRef(null);

  useEffect(() => {
    let chart;
    if (chartCanvasRef.current && finished) {
      (async () => {
        let data = await client.get('/report.json');

        data = data.map((item) => {
          const d = new Date(item.date);
          return {
            ...item,
            stress: item.stress * 100,
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            avg22: item.avg22 ? item.avg22 * 100 : 0,
          };
        });

        console.log(data);

        const scale = {
          date: {
            type: 'timeCat',
            mask: 'MM/DD',
            tickCount: 3,
            alias: '日期',
          },
          stress: {
            tickCount: 5,
            min: 0,
            max: 100,
            alias: '压力值',
            range: [0, 1],
            genre: '压力值',
          },
          avg22: {
            tickCount: 5,
            min: 0,
            max: 100,
            genre: '22天平均压力值',
            range: [0, 1],
          },
        };

        const context = chartCanvasRef.current.getContext('2d');

        const LineChart = (
          <Canvas context={context} pixelRatio={window.devicePixelRatio}>
            <Chart data={data} scale={scale}>
              <Axis
                field="date"
                style={{
                  label: { align: 'between' },
                }}
              />
              <Axis field="stress" />
              <Point x="date" y="stress" />
              <Line x="date" y="stress" />
              <Line x="date" y="avg22" color="red" shape="smooth" />
              <Tooltip showCrosshairs />
            </Chart>
          </Canvas>
        );

        chart = new Canvas(LineChart.props);
        chart.render();
      })();
    }
    return () => {
      chart?.destroy();
    };
  }, [finished]);

  const stressState = getStressState(todayStress);

  return (
    <Card
      bordered={false}
      style={{ width: '100%', height: '100%' }}
      bodyStyle={{ maxHeight: '100%', overflowY: 'scroll' }}
    >
      {isTodaySubmitted ? (
        <div>今天已经提交过了。</div>
      ) : (
        <>
          {finished ? (
            <div>
              <Result
                style={{ padding: 0 }}
                title={<>{todayStress * 100}%</>}
                subTitle={'今天的压力值为'}
                extra={
                  <div>
                    {stressState[1]}
                    <Divider>长期压力观察</Divider>
                    <canvas
                      width={window.innerWidth - 24 * 4}
                      height={200}
                      ref={chartCanvasRef}
                    ></canvas>
                    <Divider>每日一句</Divider>
                    <Card bordered={false} bodyStyle={{ opacity: 0.55 }}>
                      <TextScroll>
                        “优秀的投机客总是在等待，总是有耐心，等待着市场证实他们的判断。要记住，在市场本身的表现证实你的看法之前，不要完全相信你的判断。”
                        ————杰西·利弗莫尔
                      </TextScroll>
                    </Card>
                  </div>
                }
                icon={
                  <img
                    style={{ display: 'inline-block', width: '40%' }}
                    src={stressState[0]}
                  ></img>
                }
              ></Result>
            </div>
          ) : (
            <>
              <Progress
                style={{ width: '100%' }}
                steps={questions.length}
                percent={(activeQuestion / questions.length) * 100}
                showInfo={false}
              ></Progress>
              <Form
                form={form}
                layout="vertical"
                onFinish={async (val) => {
                  const data = Object.keys(val).map((id) => {
                    return {
                      id,
                      value: val[id],
                    };
                  });
                  const { stress } = await submitDaily(data);
                  setTodayStress(stress);
                  setFinished(true);
                }}
              >
                {questions?.map(({ id, title }, index) => {
                  return (
                    <FormItem
                      name={id}
                      label={title}
                      key={id}
                      style={{
                        display: index === activeQuestion ? 'block' : 'none',
                      }}
                    >
                      <Radio.Group
                        onChange={(e) => {
                          if (index === questions.length - 1) {
                            form.submit();
                          } else {
                            setActiveQuestion(activeQuestion + 1);
                          }
                        }}
                      >
                        <Radio name={id} value={0}>
                          1
                        </Radio>
                        <Radio name={id} value={1}>
                          2
                        </Radio>
                        <Radio name={id} value={2}>
                          3
                        </Radio>
                        <Radio name={id} value={3}>
                          4
                        </Radio>
                        <Radio name={id} value={4}>
                          5
                        </Radio>
                      </Radio.Group>
                    </FormItem>
                  );
                })}
              </Form>
            </>
          )}
        </>
      )}
    </Card>
  );
}
