import { Constant } from "@ot-builder/prelude";

import { LayoutCommon } from "../../common";
import { GposSinglePropT, LookupAlgT, LookupT } from "../general/lookup";

export class GposSingleLookupT<G, X> implements GposSinglePropT<G, X>, LookupT<G, X> {
    public rightToLeft = false;
    public ignoreGlyphs = new Set<G>();
    public adjustments: Map<G, LayoutCommon.Adjust.T<X>> = new Map();

    public acceptLookupAlgebra<E>(alg: LookupAlgT<G, X, E>): E {
        return alg.gposSingle(Constant(this));
    }
}