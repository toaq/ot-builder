import { OtGlyph } from "../ot-glyph";

import { OtGhCountPoint } from "./count-point";
import { OtGhGetBound } from "./get-bound";
import { OtGhPointLister } from "./point-lister";
import { StatGeometryVisitorClass } from "./shared";
export { OtGhStdPointAttachRectifier as StdPointAttachRectifier } from "./point-attach-rectifier";

export namespace OtGeometryHandler {
    export const ListPoint = OtGhPointLister;
    export const GetBound = OtGhGetBound;
    export const CountPoint = OtGhCountPoint;

    export function stat<T>(cls: StatGeometryVisitorClass<T>, ...gs: OtGlyph.Geometry[]): T {
        const sink = new cls();
        for (const g of gs) g.acceptGeometryVisitor(sink);
        return sink.getResult();
    }
}
