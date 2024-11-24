import express from 'express';

const app = express();

// GET '/' (トップアクセス時の挙動)
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

// GET '/user/:id' に一致するGETの挙動
app.get('/user/:id', (req, res) => {
  res.status(200).send(req.params.id);
});

// ポート3000でサーバーを起動
app.listen(3000, () => {
  // サーバー起動後に呼び出されるCallback
  console.log('start listening');
});
