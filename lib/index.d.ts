import Errawr, { Interpolator, Gettable } from './errawr';
import rawr from './rawr';
import { hasName, isError } from './helpers';
interface InvariantStatic {
    (condition: false, reason: string | Interpolator, info?: Gettable): never;
    (condition: any, reason: string | Interpolator, info?: Gettable): asserts condition;
}
declare const invariant: InvariantStatic;
export { Errawr, Errawr as Error, rawr, invariant, hasName, isError };
export default Errawr;
