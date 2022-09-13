import './App.css';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Grid, TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { MathJax } from 'better-react-mathjax';
import { useState } from 'react';
import { HorizontalGridLines, LineSeries, MarkSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
import * as math from 'mathjs';
import { useEffect } from 'react';
import RefreshIcon from '@material-ui/icons/Refresh';

const INITIAL_F = 'x';
const INITIAL_A = '0';
const INITIAL_B = '2';
const INITIAL_N = '20';
const FAIL_COLOR = '#ff0000';
const SUCCESS_COLOR = '#00ff00';
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

  useEffect(() => {
    // algo
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
      if(metodo === 0) {
        randomizePoints(newData);
      }
      else {
        setRandomPoints([]);
      }
    } catch (error) {

    }
  }, [a, b, n, f, metodo]);

  function handleMetodoChange(metodo) {
    setMetodo(metodo);
  }

  function handleFChange(newValue) {
    setF(newValue.target.value);
  }

  function handleAChange(newValue) {
    setA(newValue.target.value);
  }

  function handleBChange(newValue) {
    setB(newValue.target.value);
  }

  function handleNChange(newValue) {
    setN(newValue.target.value);
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

  return (
    <Grid container spacing={3} style={{padding: 10}}>
      <Grid item xs={12}>
        <Typography style={{textAlign: 'center', color: 'white'}} variant='h4'>
          Aproximación de integración numérica por {metodos[metodo].title}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography>Gráfico</Typography>
                <XYPlot height={600} width={900}>
                  <VerticalGridLines />
                  <HorizontalGridLines />
                  <XAxis />
                  <YAxis />
                  <LineSeries data={data}/>
                  <MarkSeries
                    colorType='literal'
                    stroke={'black'}
                    data={randomPoints}
                  />
                </XYPlot>
                <Typography style={{textAlign: 'center'}}>
                  {`${successPoints} aciertos y ${failedPoints} fallos`}
                </Typography>
                <MathJax>
                  {`$$
                    \\int_{${a}}^{${b}} ${texExpression}dx
                    \\approx
                    \\frac{${successPoints}}{${randomPoints.length}}
                    \\times (${b} ${a < 0 ? `+ ${math.abs(a)}` : `- ${a}`})
                    \\times ${math.round(maxY, 2)}
                    \\approx ${montecarloValue}
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
                      onClick={() => handleMetodoChange(0)}
                    >
                      Montecarlo
                    </Button>
                    <Button
                      size='large'
                      variant={metodo === 1 ? 'contained' : 'outlined'}
                      color="primary"
                      fullWidth
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
                    onChange={handleFChange}
                  />
                </div>
                <div>
                  <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Valor de a</Typography>
                  <TextField
                    value={a}
                    variant="outlined"
                    placeholder='0'
                    fullWidth
                    onChange={handleAChange}
                  />
                </div>
                <div>
                  <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Valor de b</Typography>
                  <TextField
                    value={b}
                    variant="outlined"
                    placeholder='2'
                    fullWidth
                    onChange={handleBChange}
                  />
                </div>
                <div>
                  <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Valor de N</Typography>
                  <TextField
                    value={n}
                    variant="outlined"
                    placeholder='10'
                    fullWidth
                    onChange={handleNChange}
                  />
                </div>
                <div>
                  <Button
                    size='large'
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<RefreshIcon />}
                    onClick={handleRefreshRandomPoints}
                  >
                    Regenerar puntos
                  </Button>
                </div>
                <div>
                  <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Función a evaluar</Typography>
                  <MathJax>{`$$\\int_{${a}}^{${b}} ${texExpression}dx, \\text{ }N=${String(n)}$$`}</MathJax>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
