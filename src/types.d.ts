type Rectangle = {
  x0: number;
  x: number;
  y0: number;
  y: number;
  color: string;
}

type Point = {
  x: number;
  y: number;
  color?: string;
  isFailure?: boolean;
}

type ChartData = {
  tex: string;
  data: LinePoint[];
}

type MethodsType = "MONTECARLO" | "RECTANGLES"

type MethodDescription = {
  nombre: string;
  title: string;
}
