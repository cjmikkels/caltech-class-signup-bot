const puppeteer = require('puppeteer');
const {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
  getProperty,
  getElementText,
  selectClassInfo,
  signUpForGivenClass,
  format,
} = require('./utils');
const { htmlTagAttributes } = require('./constants');

require('dotenv').config();

const { USERNAME, PASSWORD } = process.env;

const classes = [
  {
    department: 'Ma',
    offeringName: 'Ma 1c',
    sectionInstructor: '7',
  },
  // {
  //   department: 'Ma',
  //   offeringName: 'Ma 001C',
  //   sectionInstructor: '07 Yu, T',
  // },
];

const sizeOfClassNumber = 3;
const sizeOfSectionNumber = 2;

for (const desiredClass of classes) {
  desiredClass.offeringName = format(
    desiredClass.offeringName,
    sizeOfClassNumber,
  );

  desiredClass.sectionInstructor = format(
    desiredClass.sectionInstructor,
    sizeOfSectionNumber,
  );
}

let config = {
  canViewBrowser: true,
  delayInMilliseconds: 0,
  classes: classes,
};

const signIn = async (page) => {
  await typeIntoElement(page, 'input[name=login]', USERNAME);
  await typeIntoElement(page, 'input[name=password]', PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click('input[type=submit]'),
  ]);
};

const signUpForClasses = async (page, enterNewCourseUrl) => {
  const classesToSignUpFor = config.classes;

  for (const classToSignUpFor of classesToSignUpFor) {
    await signUpForGivenClass(page, classToSignUpFor);
    await page.goto(enterNewCourseUrl);
  }
};

const main = async () => {
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
  const frameUrl = await getProperty(frameHandle, htmlTagAttributes.SRC);

  const page3 = await browser.newPage();
  await page3.goto(frameUrl);

  await signUpForClasses(page3, frameUrl);
};

main();
