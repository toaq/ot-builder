import { Delay } from "@ot-builder/prelude";

import {
    ChainingApplicationT,
    ChainingRuleT,
    ForwardChainingPropT,
    LookupAlgT,
    LookupT
} from "../general/lookup";

export abstract class ForwardChainingLookupBaseT<G, X> {
    public rightToLeft = false;
    public ignoreGlyphs = new Set<G>();
    public rules: ChainingRuleT<Set<G>, LookupT<G, X>>[] = [];

    public abstract acceptLookupAlgebra<E>(alg: LookupAlgT<G, X, E>): E;
    protected getProps<E>(alg: LookupAlgT<G, X, E>): ForwardChainingPropT<G, X, E> {
        const rules1: ChainingRuleT<Set<G>, E>[] = [];
        for (const rule of this.rules) {
            const applications1: ChainingApplicationT<E>[] = [];
            for (const app of rule.applications) {
                const lookupE: E = alg.crossReference
                    ? alg.crossReference(
                          app.apply,
                          Delay(() => app.apply.acceptLookupAlgebra(alg))
                      )
                    : app.apply.acceptLookupAlgebra(alg);
                applications1.push({ at: app.at, apply: lookupE });
            }
            rules1.push({ ...rule, applications: applications1 });
        }
        return {
            rightToLeft: this.rightToLeft,
            ignoreGlyphs: this.ignoreGlyphs,
            rules: rules1
        };
    }
}
export class GsubChainingLookupT<G, X> extends ForwardChainingLookupBaseT<G, X>
    implements ForwardChainingPropT<G, X, LookupT<G, X>>, LookupT<G, X> {
    public acceptLookupAlgebra<E>(alg: LookupAlgT<G, X, E>): E {
        return alg.gsubChaining(Delay(() => this.getProps(alg)));
    }
}

export class GposChainingLookupT<G, X> extends ForwardChainingLookupBaseT<G, X>
    implements ForwardChainingPropT<G, X, LookupT<G, X>>, LookupT<G, X> {
    public acceptLookupAlgebra<E>(alg: LookupAlgT<G, X, E>): E {
        return alg.gposChaining(Delay(() => this.getProps(alg)));
    }
}