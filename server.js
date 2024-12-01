import express from 'express';
import Redis from 'ioredis';

const app = express();

// redisはEventEmmiterを継承している
const redis = new Redis({
  port: 6379,
  host: 'localhost',
  password: process.env.REDIS_PASSWORD,
  // ioredisの機能
  // Redis接続開始前に処理をキューイングできる
  // 利用できない場合にもサーバーが起動することがあるのでfalseに設定
  enableOfflineQueue: false,
});

// Redisに初期データをセットする
const init = async () => {
  // Promise.allで同時にセットする
  await Promise.all([
    redis.set('users:1', JSON.stringify({ id: 1, name: 'alpha' })),
    redis.set('users:2', JSON.stringify({ id: 1, name: 'bravo' })),
    redis.set('users:3', JSON.stringify({ id: 1, name: 'charlie' })),
    redis.set('users:4', JSON.stringify({ id: 1, name: 'delta' })),
  ]);
};

// GET '/' (トップアクセス時の挙動)
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.get('/users', async (req, res) => {
  try {
    const stream = redis.scanStream({
      match: 'users:*',
      count: 2,
    });

    const users = [];
    for await (const resultKeys of stream) {
      for (const key of resultKeys) {
        const value = await redis.get(key);
        const user = JSON.parse(value);
        users.push(user);
      }
    }
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send('internal error');
  }
});

// GET '/user/:id' に一致するGETの挙動
app.get('/user/:id', async (req, res) => {
  try {
    const key = `users:${req.params.id}`;
    const val = await redis.get(key);
    const user = JSON.parse(val);
    res.status(200).send(req.params.id);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internel error');
  }
});

redis.once('ready', async () => {
  try {
    await init();

    app.listen(3000, () => {
      console.log('start listening');
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

redis.on('error', (err) => {
  console.log(err);
  process.exit(1);
});
