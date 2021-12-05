type MissingRefCallback = (ref: string) => any;
type ViewValue = string | number;
type ViewData = {
  [x: number]: ViewData | ViewValue;
  [k: string]: ViewData | ViewValue | ViewData[];
};
type PeelingPossibleSubOnions = ViewData | ViewValue | ViewData[];
type Peeler = keyof ViewData | keyof ViewValue | keyof ViewData[];//keyof PeelingPossibleSubOnions;
