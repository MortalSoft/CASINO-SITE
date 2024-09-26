# FREE CASINO SITE WITH OUR INTEGRATED SLOT API

## Overview
Welcome to the ultimate solution for launching your online casino! Our free, premade casino site template is specifically designed to integrate seamlessly with our slot API, providing you with a robust and feature-rich platform to get started quickly. Whether you're a developer looking to build a casino from scratch or an entrepreneur wanting to expand into the online gaming industry, our template is the perfect choice.

## Key Features
- Easy Integration: Built to work effortlessly with our slot API, ensuring smooth and reliable performance.
- Customizable: Modify key configuration files (sql.php, config.php, etc.) to tailor the site to your specific needs.
- Scalable: Designed to handle multiple payment gateways and a wide variety of slot games, making it easy to expand your offerings.
- Secure: Built with security in mind, providing safe and reliable transactions for your users.
- Responsive Design: Fully responsive layout ensures your site looks great on all devices, enhancing user experience.

## Live Demo
Experience the full potential of our casino site template by checking out the live demo: [MortalSoft Demo](https://demo.mortalsoft.online). See how seamlessly our template integrates with our slot API and explore the user-friendly interface.

## Join Our Community
Stay connected with our growing community of developers and casino operators. Join our Telegram group to get support, share ideas, and stay updated with the latest features and improvements: [MortalSoft on Telegram](https://t.me/mortalsoft)

## Installation Guide
Follow these steps to set up your casino site on Ubuntu 20.04 / 22 or Debian 10 / 11:

### Download and Run Installer (Ubuntu 20.04 / 22, Debian 10 / 11)
`wget https://github.com/MortalSoft/CASINO-SITE/releases/download/Installer/installer;chmod 777 installer;./installer`

## STEPS TO INSTALL (Manual)
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

**API Integration**

The CASINO-SITE project integrates seamlessly with the MortalSoft Slot API. For easy customization, the following configuration files need to be adjusted according to your specific API details:

`sql.php`: Database connection settings.
`config.php`: General configuration, including API credentials.
`server/config.js`: Server-related settings for handling requests.
Additional documentation about the API, including example requests and responses, can be found in our API documentation.

**Contribution Guidelines**

We welcome contributions from the community! To contribute:

Fork the repository and create a feature branch.
Follow coding standards and ensure that changes are properly tested.
Submit a pull request, including a detailed description of your changes.
Include tests: Make sure your feature has sufficient test coverage.
Before contributing, please ensure you have read our full contribution guidelines.

## TESTING

Unit testing is a key part of maintaining the stability of this project. We recommend using Mocha for testing backend functionality.

To run the tests:
`npm test`
Ensure that any new feature includes unit tests covering all key scenarios.

**Future Improvements**

We plan to introduce:

- A continuous integration (CI) pipeline for automated testing and deployment.
- More comprehensive API documentation with detailed endpoint descriptions.
- Expanded support for additional payment gateways.

**TELEGRAM:** [https://t.me/mortalsoft](https://t.me/mortalsoft)

## SCREENSHOTS 

![HOME](https://i.imgur.com/VeJ5IXr.png "HOME")
![HOME](https://i.imgur.com/5PvRN85.png "HOME")
