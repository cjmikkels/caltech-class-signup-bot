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

const signUpForClasses = async (page) => {
  const classToSignUpFor = config.classes[0];

  await Promise.all([
    page.select('select#P63_DEPARTMENT', '142'),
    page.waitForSelector('select#P63_DEPARTMENT'),
  ]);

  await page.waitForFunction(
    () => document.querySelector('select#P63_OFFERING_NAME').length > 1,
  );
  await page.select('select#P63_OFFERING_NAME', '86961');

  await page.waitForFunction(
    () => document.querySelector('select#P63_SECTION_INSTRUCTOR').length > 1,
  );
  await page.select('select#P63_SECTION_INSTRUCTOR', '308698');

  await page.waitForFunction(
    () => document.querySelector('select#P63_GRADE_SCHEME').length > 0,
  );

  // await clickElementWithCertainText(page, 'Save', HTMLtag.Span);
};

const start = async () => {
  const browser = await puppeteer.launch({
    headless: !config.canViewBrowser,
    slowMo: config.delayInMilliseconds,
  });

  const page = await browser.newPage();

  const accessUrl = 'access.caltech.edu';
  const regisUrl = 'access.caltech.edu/pls/regis';
  const regisUrlLong =
    'access.caltech.edu/pls/regis/f?p=2000:24:282218498625:::::';

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

  await clickElementWithCertainText(
    page2,
    'Enter New Course',
    HTMLtag.Span,
    false,
  );

  await page2.waitForSelector('iframe');
  const frameHandle = await page2.$('iframe');
  const frameUrl = await (await frameHandle.getProperty('src')).jsonValue();

  const page3 = await browser.newPage();
  await page3.goto(frameUrl);

  await signUpForClasses(page3);
};

start();
