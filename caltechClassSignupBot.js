const puppeteer = require('puppeteer');
const {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
} = require('./utils');

require('dotenv').config();

const config = {
  canViewBrowser: true,
  delayInMilliseconds: 1000,
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
  await page.goto(
    'https://access.caltech.edu/pls/regis/f?p=2000:24:282218498625:::::',
  );

  await signIn(page);

  // Open REGIS
  await clickElementWithCertainText(
    page,
    'Registrar Information Systems (REGIS)',
    HTMLtag.A,
  );

  // await clickElementWithCertainText(page, `Course Enrollment `, HTMLtag.A);
  // await clickElementWithCertainText(page, `"Course Enrollment "`, HTMLtag.A);
  // await clickElementWithCertainText(
  //   page,
  //   `Course Enrollment <span class="links-block__link__arrow">&nbsp; &gt;</span>`,
  //   HTMLtag.A,
  // );
  // await clickElementWithCertainText(
  //   page,
  //   `"Course Enrollment "<span class="links-block__link__arrow">&nbsp; &gt;</span>`,
  //   HTMLtag.A,
  // );

  // await page.click('a.links-block__link'); //
  console.log(await page.content());

  // await browser.close();
};

signupForClasses();
