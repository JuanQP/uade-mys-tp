import * as math from "mathjs";
import { FAIL_COLOR, SUCCESS_COLOR } from "./App";

export const X_VALUES_COUNT = 50;

export function setFieldValue(setter: React.Dispatch<React.SetStateAction<string>>) {
  return (element: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setter(element.target.value);
}

export function getMaxY (data: Point[] = []) {
  if(data.length === 0) return 0;
  return math.max(data.map(p => p.y));
}

export function countOccurrences<T>(arr: T[], val: T) {
  return arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
}

export function countIfFailure(pointsData: Point[] = [], boolean = true) {
  return countOccurrences(pointsData.map(a => a.isFailure), boolean)
}

/**
 * Generate data to plot the chart
 * @param {String} f String to be parsed
 * @param {Number} a Left limit of the chart
 * @param {Number} b Right limit of the chart
 * @returns
 */
export function generateChartData(f: string, a: number, b: number): ChartData {
  const newExpression = math.parse(f);
  const compiledExpression = newExpression.compile();
  const newX = math.range(a, b, (b-a)/X_VALUES_COUNT, true).toArray();
  const newData = newX.map(x => ({
    x: Number(x),
    y: Number(compiledExpression.evaluate({x}))
  }));

  return {
    tex: newExpression.toTex(),
    data: newData,
  };
}

/**
 * Generate random (x,y) points with the data of this chart
 */
export function generateRandomPointsData(f: string, a: number, b: number, n: number, data: Point[]): Point[] {
  const compiledF = math.compile(f);
  const randomXValues = math.random([n], a, b);
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

export function montecarloApprox(randomPoints: Point[] = [], b: number, a: number) {
  const maxY = getMaxY(randomPoints);
  const successPointsCount = countIfFailure(randomPoints, false);
  return math.round((successPointsCount/randomPoints.length) * (b-a) * maxY, 2);
}

export function rectanglesApprox(f: string, a: number, b: number, n: number): Rectangle[] {
  const rectangleWidth = (b-a)/n;
  const expression = math.compile(f);
  return math.range(a, b, rectangleWidth, false).toArray().map((val) => {
    const numberVal = Number(val)
    const yValue: number = expression.evaluate({x: numberVal + rectangleWidth/2});
    const hasNegativeHeight = yValue < 0;
    return {
      x0: Number(numberVal), // Rectangle left side coordinate
      x: Number(numberVal) + rectangleWidth, // Rectangle right side coordinate
      y0: 0,
      y: yValue, // Rectangle height (Y value)
      color: hasNegativeHeight ? FAIL_COLOR : SUCCESS_COLOR,
    };
  });
}
