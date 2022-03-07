const puppeteer = require('puppeteer');
const {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
} = require('./utils');

require('dotenv').config();

const config = {
  canViewBrowser: true,
  delayInMilliseconds: 0,
  classes: [
    {
      department: 'Ch',
      className: 'Ch 006A',
      section: '01 Beauchamp, J',
    },
  ],
};

const { USERNAME, PASSWORD } = process.env;

const signIn = async (page) => {
  await typeIntoElement(page, 'input[name=login]', USERNAME);
  await typeIntoElement(page, 'input[name=password]', PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click('input[type=submit]'),
  ]);
};

const signUpForClasses = async (page2) => {
  console.log('in sufc fxn');
  const classToSignUpFor = config.classes[0];

  // await page2.select('#P63_DEPARTMENT', 'Ch');
  // await page2.select('select#P63_DEPARTMENT', 'Ch');
  // console.log(await page2.contents());
  // await page2.select('select[name=P63_DEPARTMENT]', 'Ch');
  // await page2.select('select[name=P63_DEPARTMENT]', 'Ch');
  await Promise.all([
    page2.select('select[name=P63_DEPARTMENT]', 'Ch'),
    page2.waitForSelector('select[name=P63_DEPARTMENT]'),
  ]);
};

const signupForClasses = async () => {
  const browser = await puppeteer.launch({
    headless: !config.canViewBrowser,
    slowMo: config.delayInMilliseconds,
  });

  const page = await browser.newPage();

  const accessUrl = 'access.caltech.edu';
  const regisUrl = 'access.caltech.edu/pls/regis/f?p=2000:24:282218498625:::::';

  await page.goto(`https://${accessUrl}`);

  await signIn(page);

  /*
  Clicking REGIS opens a new tab, so we need to wait until this tab
  has finished being created then switch to it.
  */

  // Create a promise to hold the new page
  const newPagePromise = new Promise((x) =>
    browser.once('targetcreated', (target) => x(target.page())),
  );

  // Click on the link to open REGIS, thereby opening a new tab
  await clickElementWithCertainText(
    page,
    'Registrar Information Systems (REGIS)',
    HTMLtag.A,
  );

  // Wait for the new page promise to resolve, then switch to it
  const page2 = await newPagePromise;
  await page2.bringToFront();

  await clickElementWithCertainText(page2, 'Course Enrollment ', HTMLtag.A);

  await clickElementWithCertainText(page2, 'Course Enrollment', HTMLtag.A);

  // For some reason, only doing this twice doesn't work consistently,
  // so we do it a 3rd time just in case
  await clickElementWithCertainText(page2, 'Course Enrollment', HTMLtag.A);

  console.log('bfr new course');
  await clickElementWithCertainText(
    page2,
    'Enter New Course',
    HTMLtag.Span,
    false,
  );
  console.log('after new course');
  console.log(await page2.content());
  debugger;
  // console.log('helloooo');
  // await page2.waitForSelector('select[name=P63_DEPARTMENT]');
  // await page.waitFor(1000);
  // console.log('selector should be here');
  // await signUpForClasses(page2);

  const page3 = await browser.newPage();
  await page3.goto(`https://google.com`);
  console.log(await page3.content());
};

signupForClasses();
