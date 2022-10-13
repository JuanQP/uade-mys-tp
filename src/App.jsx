import './App.css';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Container, Grid, TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { MathJax } from 'better-react-mathjax';
import { useState } from 'react';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, MarkSeries, VerticalGridLines, VerticalRectSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import * as math from 'mathjs';
import { useEffect } from 'react';
import RefreshIcon from '@material-ui/icons/Refresh';
import CheckIcon from '@material-ui/icons/Check';
import { setFieldValue } from './utils';

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

const INITIAL_F = 'x';
const INITIAL_A = '0';
const INITIAL_B = '2';
const INITIAL_N = '20';
const FAIL_COLOR = '#FF6962';
const SUCCESS_COLOR = '#77DD76';
const X_VALUES_COUNT = 50;

const metodos = [
  {nombre: 'Montecarlo', title: 'método de Montecarlo'},
  {nombre: 'Rectángulos', title: 'método de los Rectángulos'},
];

const {tex: initialTex, data: initialData} = chartData(INITIAL_F, INITIAL_A, INITIAL_B);
const initialRandomPointsData = randomPointsData(INITIAL_F, INITIAL_A, INITIAL_B, INITIAL_N, initialData);

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

function getMaxY (data) {
  return math.max(data.map(p => p.y));
}

function chartData(f, a, b) {
  // Chart
  const newExpression = math.parse(f);
  const compiledExpression = newExpression.compile();
  const newX = math.range(a, b, (b-a)/X_VALUES_COUNT, true).toArray();
  const newData = newX.map(x => ({x: x, y: compiledExpression.evaluate({x})}));

  return {
    tex: newExpression.toTex(),
    data: newData,
  }
}

function randomPointsData(f, a, b, n, data) {
  // Random points
  const compiledF = math.compile(f);
  const randomX = math.random([1, n], a, b)[0];
  const randomMaxValue = getMaxY(data);
  const randomPointsData = randomX.map(x => {
    const yValue = compiledF.evaluate({x});
    const randomY = math.random(0, randomMaxValue);
    const isFailure = randomY > yValue;
    return {
      x,
      y: randomY,
      color: isFailure ? FAIL_COLOR : SUCCESS_COLOR,
      isFailure,
    };
  });

  return randomPointsData;
}

function App() {

  const [metodo, setMetodo] = useState(0);
  const [f, setF] = useState(INITIAL_F);
  const [a, setA] = useState(INITIAL_A);
  const [b, setB] = useState(INITIAL_B);
  const [n, setN] = useState(INITIAL_N);
  const [texExpression, setTexExpression] = useState(initialTex);
  const [data, setData] = useState(initialData);
  const [randomPoints, setRandomPoints] = useState(initialRandomPointsData);
  const [successPoints, setSuccessPoints] = useState(countOccurrences(initialRandomPointsData.map(a => a.isFailure), false));
  const [failedPoints, setFailedPoints] = useState(countOccurrences(initialRandomPointsData.map(a => a.isFailure), true));
  const [maxY, setMaxY] = useState(getMaxY(initialData));
  const [montecarloValue, setMontecarloValue] = useState(montecarloApprox(
    countOccurrences(initialRandomPointsData.map(a => a.isFailure), false),
    initialRandomPointsData,
    INITIAL_B,
    INITIAL_A,
    getMaxY(initialData),
  ));
  const [rectangles, setRectangles] = useState(rectanglesApprox(INITIAL_F, INITIAL_A, INITIAL_B, INITIAL_N));

  useEffect(() => {
    try {
      const result = math.compile(f).evaluate({x: Number(a)});
      const result2 = math.compile(f).evaluate({x: Number(b)});
      if(typeof result !== 'number' || typeof result2 !== 'number') return;
    } catch (error) {
      return;
    }

    if(a === '' || !math.hasNumericValue(a) || a >= b) return;
    if(b === '' || !math.hasNumericValue(b)) return;
    if(n === '' || !math.hasNumericValue(n) || n < 1) return;
    if(f === '') return;
    try {
      // Chart
      const {tex: newTex, data: newData} = chartData(f, a, b);
      setTexExpression(newTex);
      setData(newData);

      // Random points
      setRandomPoints([]);
      if(metodo === 0) {
        setRectangles([]);
      }
      else {
        setRectangles(rectanglesApprox(f, a, b, n));
      }
    } catch (error) {

    }
  }, [a, b, n, f, metodo]);

  function handleMetodoChange(metodo) {
    setMetodo(metodo);
  }

  function randomizePoints(data) {
    const newRandomPointsData = randomPointsData(f, a, b, n, data);
    const successPointsCount = countOccurrences(newRandomPointsData.map(a => a.isFailure), false);
    const failedPointsCount = countOccurrences(newRandomPointsData.map(a => a.isFailure), true);
    const newMaxY = getMaxY(data);
    setRandomPoints(newRandomPointsData);
    setSuccessPoints(successPointsCount);
    setFailedPoints(failedPointsCount);
    setMaxY(newMaxY);
    setMontecarloValue(montecarloApprox(successPointsCount, newRandomPointsData, b, a, newMaxY));
  }

  function handleRefreshRandomPoints() {
    randomizePoints(data);
  }

  function montecarloApprox(successPointsCount, randomPoints, b, a, maxY) {
    return math.round((successPointsCount/randomPoints.length) * (b-a) * maxY, 2);
  }

  function rectanglesApprox(f, a, b, n) {
    const width = (b-a)/n;
    const expression = math.compile(f);
    return math.range(a, b, width, false).map(val => {
      const yValue = expression.evaluate({x: val + width/2});
      return {
        x0: val,
        x: val + width,
        y: yValue,
        color: yValue < 0 ? FAIL_COLOR : SUCCESS_COLOR,
      };
    }).toArray();
  }

  function rectanglesValue(rectangles) {
    return rectangles.reduce((area, rectangle) => area + (rectangle.x - rectangle.x0) * rectangle.y, 0);
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography style={{textAlign: 'center', color: 'white', textShadow: '2px 2px #000000'}} variant='h4'>
            Aproximación de integración numérica por {metodos[metodo].title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <FlexibleXYPlot height={600}>
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <LineSeries data={data}/>
                {metodo === 0 ? (
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
                {metodo === 0 && `${successPoints} aciertos y ${failedPoints} fallos`}
              </Typography>
              <MathJax dynamic>
                {metodo === 0 ? `$$
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
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <div>
                <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Método</Typography>
                <div>
                  <Button
                    size='large'
                    variant={metodo === 0 ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    startIcon={metodo === 0 ? <CheckIcon /> : undefined}
                    onClick={() => handleMetodoChange(0)}
                  >
                    Montecarlo
                  </Button>
                  <Button
                    size='large'
                    variant={metodo === 1 ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    startIcon={metodo === 1 ? <CheckIcon /> : undefined}
                    onClick={() => handleMetodoChange(1)}
                  >
                    Rectángulos
                  </Button>
                </div>
              </div>
              <div>
                <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Función f(x)</Typography>
                <TextField
                  value={f}
                  variant="outlined"
                  placeholder='x^2'
                  fullWidth
                  onChange={setFieldValue(setF)}
                />
              </div>
              <div>
                <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Valor de a</Typography>
                <TextField
                  value={a}
                  variant="outlined"
                  placeholder='0'
                  fullWidth
                  type="number"
                  onChange={setFieldValue(setA)}
                />
              </div>
              <div>
                <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Valor de b</Typography>
                <TextField
                  value={b}
                  variant="outlined"
                  placeholder='2'
                  fullWidth
                  type="number"
                  onChange={setFieldValue(setB)}
                />
              </div>
              <div>
                <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Valor de N</Typography>
                <TextField
                  value={n}
                  variant="outlined"
                  placeholder='10'
                  fullWidth
                  type="number"
                  onChange={setFieldValue(setN)}
                />
              </div>
              <div>
                {metodo === 0 && (
                  <Button
                    size='large'
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={randomPoints.length === 0 ? undefined : <RefreshIcon />}
                    onClick={handleRefreshRandomPoints}
                  >
                    {randomPoints.length === 0 ? 'Generar puntos' : 'Regenerar puntos'}
                  </Button>
                )}
              </div>
              <div>
                <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Función a evaluar</Typography>
                <MathJax dynamic>{`$$\\int_{${a}}^{${b}} ${texExpression}dx, \\text{ }N=${String(n)}$$`}</MathJax>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
