// ANSI escape codes for colors
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const redColor = "\x1b[31m";
const cyanColor = "\x1b[36m";
const blueColor = "\x1b[34m";
const magentaColor = "\x1b[35m";
const grayColor = "\x1b[90m";
const whiteColor = "\x1b[37m";
const blackColor = "\x1b[30m";
const resetColor = "\x1b[0m";

// Helper functions with tagged template literals
function green(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${greenColor}${text}${resetColor}`;
}

function yellow(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${yellowColor}${text}${resetColor}`;
}

function red(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${redColor}${text}${resetColor}`;
}

function cyan(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${cyanColor}${text}${resetColor}`;
}

function blue(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${blueColor}${text}${resetColor}`;
}

function magenta(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${magentaColor}${text}${resetColor}`;
}

function gray(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${grayColor}${text}${resetColor}`;
}

function white(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${whiteColor}${text}${resetColor}`;
}

function black(strings, ...values) {
  const text = String.raw({ raw: strings }, ...values);
  return `${blackColor}${text}${resetColor}`;
}

module.exports = {
  green,
  yellow,
  red,
  cyan,
  blue,
  magenta,
  gray,
  white,
  black,
};