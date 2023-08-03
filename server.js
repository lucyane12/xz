const express = require('express');
const app = express();
const port = 8080;
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const conf = express.static(path.resolve("./client"));
app.use(conf);
app.use(express.json());

let messages = [];

const wss = new WebSocket.Server({ server: app.listen(port) });

wss.on('connection', (ws) => {
  //console.log('Klien terhubung.');

  // Kirimkan semua pesan yang telah disimpan ke klien yang baru terhubung
  messages.forEach((message) => {
    ws.send(JSON.stringify(message));
  });

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (!parsedMessage.sender || !parsedMessage.message) {
        ws.send(JSON.stringify({ error: 'Nama pengirim dan pesan harus diisi.' }));
      } else {
        const newMessage = {
          sender: parsedMessage.sender,
          message: parsedMessage.message,
          timestamp: new Date().toLocaleString(),
        };
        messages.push(newMessage);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newMessage));
          }
        });
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Format pesan tidak valid.' }));
    }
  });

  ws.on('close', () => {
    //console.log('Klien terputus.');
  });
});

app.get('/', async (req,res) => {
  fs.readFile('./client/index.html',(err,data) => {
    if(err) return res.json({ status : 'Error code 404' });
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(data);
    res.end();
  });
});