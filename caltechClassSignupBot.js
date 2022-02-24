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

  const accessUrl = 'access.caltech.edu';
  const regisUrl = 'access.caltech.edu/pls/regis/f?p=2000:24:282218498625:::::';

  await page.goto(`https://${accessUrl}`);

  await Promise.all([page.waitForNavigation(), signIn(page)]);

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
  // await clickElementWithCertainText(
  //   page,
  //   'Registrar Information Systems (REGIS)',
  //   HTMLtag.A,
  // );

  // Wait for the new page promise to resolve, then switch to it
  const page2 = await newPagePromise;
  await page2.bringToFront();

  // await clickElementWithCertainText(page2, 'Course Enrollment ', HTMLtag.A);

  await Promise.all([
    page2.waitForNavigation(),
    clickElementWithCertainText(page2, 'Course Enrollment ', HTMLtag.A)
  ]);

  // await page2.goBack();
  // console.log('before');
  // console.log(await page2.content());
  // // console.log('after');
  // // await page2.click('a.t-Tabs-link');
  
  await Promise.all([clickElementWithCertainText(page2, 'Course Enrollment', HTMLtag.A),
  await page2.waitForNavigation()]);

  await Promise.all([
    clickElementWithCertainText(page2, 'Course Enrollment', HTMLtag.A),
    page2.waitForNavigation()
  ]);


  await Promise.all([
    clickElementWithCertainText(page2, 'Enter New Course', HTMLtag.Span),
    page2.waitForNavigation()
  ]);

  // console.log('bfr');
  // await clickElementWithCertainText(page2, 'Course Enrollment', HTMLtag.Span);
  // console.log('aft');

  // await browser.close();
};

signupForClasses();
