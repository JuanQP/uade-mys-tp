import * as math from "mathjs";
import { FAIL_COLOR, SUCCESS_COLOR } from "./App";

export const X_VALUES_COUNT = 50;

export function setFieldValue(setter = (newValue) => {}) {
  return (element) => setter(element.target.value);
}

export function getMaxY (data = []) {
  if(data.length === 0) return 0;
  return math.max(data.map(p => p.y));
}

export function countOccurrences (arr, val) {
  return arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
}

export function countIfFailure(pointsData = [], boolean = true) {
  return countOccurrences(pointsData.map(a => a.isFailure), boolean)
}

/**
 * Generate data to plot the chart
 * @param {String} f String to be parsed
 * @param {Number} a Left limit of the chart
 * @param {Number} b Right limit of the chart
 * @returns
 */
export function generateChartData(f, a, b) {
  const newExpression = math.parse(f);
  const compiledExpression = newExpression.compile();
  const newX = math.range(a, b, (b-a)/X_VALUES_COUNT, true).toArray();
  const newData = newX.map(x => ({x: x, y: compiledExpression.evaluate({x})}));

  return {
    tex: newExpression.toTex(),
    data: newData,
  };
}

/**
 * Generate random (x,y) points with the data of this chart
 * @param {String} f
 * @param {Number} a
 * @param {Number} b
 * @param {Number} n
 * @param {object[]} data
 * @returns {object[]}
 */
export function generateRandomPointsData(f, a, b, n, data) {
  const compiledF = math.compile(f);
  const randomXValues = math.random([1, n], a, b)[0];
  const maxYValue = getMaxY(data);
  const randomPointsData = randomXValues.map(x => {
    const yValueAtX = compiledF.evaluate({x});
    const randomY = math.random(0, maxYValue);
    const randomYValueIsAboveFunction = randomY > yValueAtX;
    return {
      x,
      y: randomY,
      color: randomYValueIsAboveFunction ? FAIL_COLOR : SUCCESS_COLOR,
      isFailure: randomYValueIsAboveFunction,
    };
  });

  return randomPointsData;
}

export function montecarloApprox(randomPoints = [], b, a) {
  const maxY = getMaxY(randomPoints);
  const successPointsCount = countIfFailure(randomPoints, false);
  return math.round((successPointsCount/randomPoints.length) * (b-a) * maxY, 2);
}

export function rectanglesApprox(f, a, b, n) {
  const rectangleWidth = (b-a)/n;
  const expression = math.compile(f);
  return math.range(a, b, rectangleWidth, false).map(val => {
    const yValue = expression.evaluate({x: val + rectangleWidth/2});
    const hasNegativeHeight = yValue < 0;
    return {
      x0: val, // Rectangle left side coordinate
      x: val + rectangleWidth, // Rectangle right side coordinate
      y: yValue, // Rectangle height (Y value)
      color: hasNegativeHeight ? FAIL_COLOR : SUCCESS_COLOR,
    };
  }).toArray();
}
