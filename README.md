# UADE - Modelado y Simulación - 2022

SPA para realizar aproximaciones de áreas utilizando los métodos de Montecarlo y método de los Rectángulos.

Cursada de Modelado y Simulación, 2do Cuatrimestre

La sintaxis para escribir funciones es similar a MathJax, pero el detalle está acá:

https://mathjs.org/docs/expressions/syntax.html

# Aproximación por Montecarlo

La parte importante del cálculo de la aproximación de Montecarlo está en la siguiente parte:

```js
function montecarloApprox(successPointsCount, randomPoints, b, a, maxY) {
  return math.round((successPointsCount/randomPoints.length) * (b-a) * maxY, 2);
}
```

En particular, lo que nos interesa es:

```js
(successPointsCount / randomPoints.length) * (b-a) * maxY
```

# Aproximación por Rectángulos

Para este caso, la parte importante:

```js
function rectanglesValue(rectangles) {
  return rectangles.reduce((area, rectangle) => area + (rectangle.x - rectangle.x0) * rectangle.y, 0);
}
```
