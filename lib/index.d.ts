import Errawr from './errawr';
import rawr from './rawr';
import { hasName, isError } from './helpers';
declare const invariant: typeof Errawr.invariant;
export { Errawr, Errawr as Error, rawr, invariant, hasName, isError };
export default Errawr;
