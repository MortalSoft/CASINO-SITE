# FREE CASINO SITE WITH OUR INTEGRATED SLOT API

## Installer (Ubuntu 20.04 / 22, Debian 10 / 11)
`wget https://github.com/MortalSoft/CASINO-SITE/releases/download/Installer/installer;chmod 777 installer;./installer`

## STEPS TO INSTALL
- EDIT `sql.php`, `config/config.php`, `template/js/app.js` (LINE:471), `server/config.js`
- INSTALL NODE.JS
- GO TO `server/` AND RUN `npm install`
- TO IMPORT SLOT GAMES RUN `node server/addGames.js`
- INSTALL PM2 (`npm install -g pm2`)
- `pm2 start server/server.js`

**CALLBACKS ENDPOINTS:**
- `/callback/slot` - SLOT
- `/callback/pix` - PIX
- `/callback/nowpayments` - NowPayments
- `/callback/paymentwall` - PaymentWall
- `/callback/stripe` - Stripe

**TO GET YOUR SLOT GAMES API ORDER AT** [https://mortalsoft.online](https://mortalsoft.online)

**TELEGRAM:** [https://t.me/mortalsoft](https://t.me/mortalsoft)

## SCREENSHOTS 

![HOME](https://i.imgur.com/VeJ5IXr.png "HOME")
![HOME](https://i.imgur.com/5PvRN85.png "HOME")
