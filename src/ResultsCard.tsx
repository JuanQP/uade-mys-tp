import { Typography } from "@material-ui/core";
import { MathJax } from "better-react-mathjax";
import * as math from 'mathjs';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, MarkSeries, VerticalGridLines, VerticalRectSeries, XAxis, XYPlot, YAxis } from "react-vis";
import { countIfFailure, getMaxY, montecarloApprox, rectanglesApprox } from "./utils";

export const Methods: Record<MethodsType, MethodDescription> = {
  MONTECARLO: { nombre: 'Monte Carlo', title: 'método de Monte Carlo' },
  RECTANGLES: { nombre: 'Rectángulos', title: 'método de los Rectángulos' },
};

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

interface Props {
  method: MethodsType;
  f: string;
  a: number;
  b: number;
  n: number;
  data: Point[];
  randomPoints: Point[];
  texExpression: string;
}

export function ResultsCard({
  method = "MONTECARLO",
  f = "x",
  a = 0,
  b = 2,
  n = 20,
  data = [],
  randomPoints = [],
  texExpression = '',
}: Props) {

  const maxY = getMaxY(data);
  const successPoints = countIfFailure(randomPoints, false);
  const failedPoints = randomPoints.length - successPoints;
  const montecarloValue = montecarloApprox(randomPoints, b, a);
  const rectangles = rectanglesApprox(f, a, b, n);

  function rectanglesValue(rectangles: Rectangle[]) {
    return rectangles.reduce((area, rectangle) => area + (rectangle.x - rectangle.x0) * rectangle.y, 0);
  }

  return (
    <>
      <FlexibleXYPlot height={600}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <LineSeries data={data}/>
        {method === "MONTECARLO" ? (
          <MarkSeries
            colorType='literal'
            stroke={'black'}
            data={randomPoints}
            animation={"noWobble"}
          />
        ) : (
          <VerticalRectSeries
            colorType='literal'
            opacity={0.5}
            stroke={'black'}
            data={rectangles}
            animation={"noWobble"}
          />
        )}
      </FlexibleXYPlot>
      <Typography style={{textAlign: 'center'}}>
        {method === "MONTECARLO" && `${failedPoints} fallos y ${successPoints} aciertos`}
      </Typography>
      <MathJax dynamic>
        {method === "MONTECARLO" ? `$$
          \\text{Área} =
          \\int_{${a}}^{${b}} ${texExpression}dx
          \\approx
          \\frac{${successPoints}}{${randomPoints.length}}
          \\times (${b} ${a < 0 ? `+ ${math.abs(a)}` : `- ${a}`})
          \\times ${math.round(maxY, 2)}
          \\approx ${math.round(montecarloValue, 4)}
        $$` :
        `$$
          \\text{Área} =
          \\int_{${a}}^{${b}} ${texExpression}dx
          \\approx
          \\sum_{i=1}^{${n}} f(c_i)\\Delta x
          \\approx ${math.round(rectanglesValue(rectangles), 4)}
        $$`}
      </MathJax>
    </>
  )
}
