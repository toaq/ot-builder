import { Constant } from "@ot-builder/prelude";

import { LayoutCommon } from "../../common";
import { GposCursivePropT, LookupAlgT, LookupT } from "../general/lookup";

export class GposCursiveLookupT<G, X> implements GposCursivePropT<G, X>, LookupT<G, X> {
    public rightToLeft = false;
    public ignoreGlyphs = new Set<G>();
    public attachments: Map<G, LayoutCommon.CursiveAnchorPair.T<X>> = new Map();
    public acceptLookupAlgebra<E>(alg: LookupAlgT<G, X, E>): E {
        return alg.gposCursive(Constant(this));
    }
}