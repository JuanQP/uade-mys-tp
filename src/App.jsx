import './App.css';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Container, Grid, TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { MathJax } from 'better-react-mathjax';
import { useState } from 'react';
import * as math from 'mathjs';
import { useEffect } from 'react';
import RefreshIcon from '@material-ui/icons/Refresh';
import CheckIcon from '@material-ui/icons/Check';
import { generateChartData, generateRandomPointsData, setFieldValue } from './utils';
import { Methods, ResultsCard } from './ResultsCard';

const INITIAL_F = 'x';
const INITIAL_A = '0';
const INITIAL_B = '2';
const INITIAL_N = '20';
export const FAIL_COLOR = '#FF6962';
export const SUCCESS_COLOR = '#77DD76';

const {
  tex: initialTex,
  data: initialData,
} = generateChartData(INITIAL_F, INITIAL_A, INITIAL_B);

const initialRandomPointsData = generateRandomPointsData(
  INITIAL_F,
  INITIAL_A,
  INITIAL_B,
  INITIAL_N,
  initialData
);

export function App() {
  // Right card form data
  const [metodo, setMetodo] = useState(Methods.MONTECARLO.key);
  const [f, setF] = useState(INITIAL_F);
  const [validF, setValidF] = useState(INITIAL_F);
  const [a, setA] = useState(INITIAL_A);
  const [b, setB] = useState(INITIAL_B);
  const [n, setN] = useState(INITIAL_N);
  // Right card integral
  const [texExpression, setTexExpression] = useState(initialTex);
  // Left card calculated data
  const [data, setData] = useState(initialData);
  const [randomPoints, setRandomPoints] = useState(initialRandomPointsData);

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
      // Regenerate new chart data, and latex expression
      const {tex: newTex, data: newData} = generateChartData(f, a, b);
      setValidF(f);
      setTexExpression(newTex);
      setData(newData);
      setRandomPoints([]);
    } catch (error) {

    }
  }, [a, b, n, f, metodo]);

  function handleMetodoChange(metodo) {
    setMetodo(metodo);
  }

  function handleRefreshRandomPoints() {
    const newRandomPointsData = generateRandomPointsData(f, a, b, n, data);
    setRandomPoints(newRandomPointsData);
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography style={{textAlign: 'center', color: 'white', textShadow: '2px 2px #000000'}} variant='h4'>
            Aproximación de integración numérica por {Methods[metodo].title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <ResultsCard
                method={metodo}
                f={validF}
                a={a}
                b={b}
                n={n}
                data={data}
                randomPoints={randomPoints}
                texExpression={texExpression}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Método</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    size='large'
                    variant={metodo === Methods.MONTECARLO.key ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    startIcon={metodo === Methods.MONTECARLO.key ? <CheckIcon /> : undefined}
                    onClick={() => handleMetodoChange(Methods.MONTECARLO.key)}
                  >
                    Monte Carlo
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    size='large'
                    variant={metodo === Methods.RECTANGLES.key ? 'contained' : 'outlined'}
                    color="primary"
                    fullWidth
                    startIcon={metodo === Methods.RECTANGLES.key ? <CheckIcon /> : undefined}
                    onClick={() => handleMetodoChange(Methods.RECTANGLES.key)}
                  >
                    Rectángulos
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Función"
                    value={f}
                    variant="outlined"
                    placeholder='x^2'
                    fullWidth
                    onChange={setFieldValue(setF)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Valor de 'a'"
                    value={a}
                    variant="outlined"
                    placeholder='0'
                    fullWidth
                    type="number"
                    onChange={setFieldValue(setA)}
                  />

                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Valor de 'b'"
                    value={b}
                    variant="outlined"
                    placeholder='2'
                    fullWidth
                    type="number"
                    onChange={setFieldValue(setB)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Valor de 'n'"
                    value={n}
                    variant="outlined"
                    placeholder='10'
                    fullWidth
                    type="number"
                    onChange={setFieldValue(setN)}
                  />
                </Grid>
                <Grid item xs={12}>
                  {metodo === Methods.MONTECARLO.key && (
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
                </Grid>
                <Grid item xs={12}>
                  <Typography style={{fontWeight: 'bold', fontSize: '1.5em'}}>Función a evaluar</Typography>
                  <MathJax dynamic>{`$$\\int_{${a}}^{${b}} ${texExpression}dx, \\text{ }N=${String(n)}$$`}</MathJax>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
