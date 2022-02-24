const puppeteer = require('puppeteer');
const {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
} = require('./utils');

require('dotenv').config();

const config = {
  canViewBrowser: false,
  delayInMilliseconds: 100,
};

const { USERNAME, PASSWORD } = process.env;

const signIn = async (page) => {
  await typeIntoElement(page, 'input[name=login]', USERNAME);
  await typeIntoElement(page, 'input[name=password]', PASSWORD);

  await page.click('input[type=submit]');
};

const signupForClasses = async () => {
  const browser = await puppeteer.launch({
    headless: !config.canViewBrowser,
    slowMo: config.delayInMilliseconds,
  });

  const page = await browser.newPage();
  await page.goto('https://access.caltech.edu');

  await signIn(page);

  // await clickElementWithCertainText(page, 'Sign in', HTMLtag.A);

  // await browser.close();
};

signupForClasses();
