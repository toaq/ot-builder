import { NonNullablePtr16, NullablePtr16 } from "@ot-builder/bin-composite-types";
import { BinaryView, Frag } from "@ot-builder/bin-util";
import { ImpLib } from "@ot-builder/common-impl";
import { Errors } from "@ot-builder/errors";
import { Gpos } from "@ot-builder/ft-layout";
import { Data } from "@ot-builder/prelude";
import { Int16, UInt16 } from "@ot-builder/primitive";
import { ReadTimeIVS, WriteTimeIVS } from "@ot-builder/var-store";
import { OtVar } from "@ot-builder/variance";

import { Ptr16DeviceTable } from "./device-table";

function anchorNeedsFormat3(a: Gpos.Anchor) {
    return !OtVar.Ops.isConstant(a.x) || !OtVar.Ops.isConstant(a.y) || a.xDevice || a.yDevice;
}

export const GposAnchor = {
    read(bp: BinaryView, ivs: Data.Maybe<ReadTimeIVS>): Gpos.Anchor {
        const format = bp.uint16();
        if (format === 1) {
            return {
                x: bp.int16(),
                y: bp.int16()
            };
        } else if (format === 2) {
            return {
                x: bp.int16(),
                y: bp.int16(),
                attachToPoint: { pointIndex: bp.uint16() }
            };
        } else if (format === 3) {
            let x: OtVar.Value = bp.int16();
            let y: OtVar.Value = bp.int16();
            const xDD = bp.next(Ptr16DeviceTable, ivs);
            const yDD = bp.next(Ptr16DeviceTable, ivs);
            return {
                x: OtVar.Ops.add(x, xDD ? xDD.variation : 0),
                y: OtVar.Ops.add(y, yDD ? yDD.variation : 0),
                xDevice: xDD ? xDD.deviceDeltas : null,
                yDevice: yDD ? yDD.deviceDeltas : null
            };
        } else {
            throw Errors.FormatNotSupported("anchor", format);
        }
    },
    write(bb: Frag, a: Gpos.Anchor, ivs: Data.Maybe<WriteTimeIVS>) {
        if (a.attachToPoint) {
            bb.uint16(2);
            bb.int16(ImpLib.Arith.Round.Coord(OtVar.Ops.originOf(a.x)));
            bb.int16(ImpLib.Arith.Round.Coord(OtVar.Ops.originOf(a.y)));
            bb.uint16(a.attachToPoint.pointIndex);
        } else if (anchorNeedsFormat3(a)) {
            const dtX = { variation: a.x, deviceDeltas: a.xDevice };
            const dtY = { variation: a.y, deviceDeltas: a.yDevice };
            bb.uint16(3);
            bb.int16(ImpLib.Arith.Round.Coord(OtVar.Ops.originOf(a.x)));
            bb.int16(ImpLib.Arith.Round.Coord(OtVar.Ops.originOf(a.y)));
            bb.push(Ptr16DeviceTable, dtX, ivs);
            bb.push(Ptr16DeviceTable, dtY, ivs);
        } else {
            bb.uint16(1);
            bb.int16(ImpLib.Arith.Round.Coord(OtVar.Ops.originOf(a.x)));
            bb.int16(ImpLib.Arith.Round.Coord(OtVar.Ops.originOf(a.y)));
        }
    },
    measure(a: Data.Maybe<Gpos.Anchor>) {
        if (!a) return 0;
        const s = Int16.size * 3;
        if (a.attachToPoint) return s + Int16.size;
        else {
            if (!anchorNeedsFormat3(a)) {
                return s;
            } else {
                return (
                    UInt16.size * 8 +
                    (a.xDevice ? a.xDevice.length : 0) +
                    (a.yDevice ? a.yDevice.length : 0)
                );
            }
        }
    }
};

export const NullablePtr16GposAnchor = NullablePtr16(GposAnchor);
export const Ptr16GposAnchor = NonNullablePtr16(GposAnchor);
