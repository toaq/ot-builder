import { BinaryView, Frag } from "@ot-builder/bin-util";
import { OtListGlyphStoreFactory } from "@ot-builder/ot-glyphs";
import { Merg } from "@ot-builder/ot-layout";

import { MergTableIo } from "../merg";

test("Merg: Round trip", () => {
    const gs = OtListGlyphStoreFactory.createStoreFromSize(8);
    const gOrd = gs.decideOrder();
    const doMerge = new Merg.Entry(new Merg.Flags(true), new Merg.Flags(false));
    const doNotMerge = new Merg.Entry(new Merg.Flags(false), new Merg.Flags(false));
    const entries = [
        [doMerge, doNotMerge],
        [doNotMerge, doNotMerge]
    ];
    const classes = new Map([
        [gs.items[1], 1],
        [gs.items[4], 1],
        [gs.items[5], 1]
    ]);
    const merg = new Merg.Table(entries, classes);
    const buffer = Frag.packFrom(MergTableIo, merg, gOrd);
    const result = new BinaryView(buffer).next(MergTableIo, gOrd);
    expect(result).toEqual(merg);
});
