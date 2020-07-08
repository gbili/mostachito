type MissingRefCallback = (ref: string) => any;
type ViewData = {
  [x: number]: ViewData | string;
  [k: string]: ViewData | string | ViewData[];
};
type PeelingPossibleSubOnions = ViewData | string | ViewData[]; 
type Peeler = keyof ViewData | keyof string | keyof ViewData[];//keyof PeelingPossibleSubOnions;
