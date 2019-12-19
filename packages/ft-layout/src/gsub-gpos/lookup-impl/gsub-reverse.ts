import { Constant } from "@ot-builder/prelude";

import {
    GsubReverseRuleT,
    GsubReverseSingleSubPropT,
    LookupAlgT,
    LookupT
} from "../general/lookup";

export class GsubReverseSingleSubLookupT<G, X>
    implements GsubReverseSingleSubPropT<G, X>, LookupT<G, X> {
    public rightToLeft = false;
    public ignoreGlyphs = new Set<G>();
    public rules: GsubReverseRuleT<G, Set<G>>[] = [];
    public acceptLookupAlgebra<E>(alg: LookupAlgT<G, X, E>): E {
        return alg.gsubReverse(Constant(this));
    }
}