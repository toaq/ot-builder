import { NonNullablePtr16 } from "@ot-builder/bin-composite-types";
import { BinaryView, Frag } from "@ot-builder/bin-util";
import { Assert, Errors } from "@ot-builder/errors";
import { OtGlyph } from "@ot-builder/ot-glyphs";
import { Merg as OtMerg } from "@ot-builder/ot-layout";
import { Data } from "@ot-builder/prelude";

import { ClassDef } from "../shared/class-def";

export const MergTableIo = {
    read(bv: BinaryView, gOrd: Data.Order<OtGlyph>) {
        const version = bv.uint16();
        Assert.VersionSupported("MergTable", version, 0);
        const classCount = bv.uint16();
        const entries = bv.next(Ptr16EntryTable, classCount);
        const classDefCount = bv.uint16();
        const classes = bv.next(Ptr16ClassDefs, classDefCount, bv, gOrd);
        return new OtMerg.Table(entries, classes);
    },
    write(fr: Frag, merg: OtMerg.Table, gOrd: Data.Order<OtGlyph>) {
        fr.uint16(0);
        fr.uint16(merg.entries.length);
        fr.push(Ptr16EntryTable, merg.entries);
        // For now we lump everything into one class def
        fr.uint16(1);
        // Because the class def offsets need to be relative to the MERG table
        // rather than the class defs array, embed the array in a known position
        // and create the pointer manually
        fr.uint16(fr.size + 2);
        fr.embed(Frag.from(ClassDefs, merg.classes, gOrd));
    }
};

const ClassDefs = {
    read(bv: BinaryView, classDefCount: number, mergView: BinaryView, gOrd: Data.Order<OtGlyph>) {
        return new Map(
            bv.array(classDefCount, Ptr16ClassDef, mergView, gOrd).flatMap(defs => [...defs])
        );
    },
    write(fr: Frag, classes: Map<OtGlyph, number>, gOrd: Data.Order<OtGlyph>) {
        // Lump everything into one class def
        fr.push(Ptr16ClassDef, classes, gOrd);
    }
};

const Ptr16ClassDefs = NonNullablePtr16(ClassDefs);

const Ptr16ClassDef = {
    read(bv: BinaryView, mergView: BinaryView, gOrd: Data.Order<OtGlyph>) {
        // The offsets are relative to the MERG table, not the local array
        const p = bv.uint16();
        if (!p) throw Errors.NullPtr();
        return mergView.lift(p).next(ClassDef, gOrd);
    },
    write(fr: Frag, classes: Map<OtGlyph, number>, gOrd: Data.Order<OtGlyph>) {
        // This pointer will become relative to the MERG table when it's
        // embedded by MergTableIo above
        fr.ptr16(Frag.from(ClassDef, classes, gOrd));
    }
};

const EntryTable = {
    read(bv: BinaryView, classCount: number) {
        return bv.array(classCount, EntryRow, classCount);
    },
    write(fr: Frag, entries: OtMerg.Entry[][]) {
        return fr.array(EntryRow, entries);
    }
};

const Ptr16EntryTable = NonNullablePtr16(EntryTable);

const EntryRow = {
    read(bv: BinaryView, classCount: number) {
        return bv.array(classCount, Entry);
    },
    write(fr: Frag, entries: OtMerg.Entry[]) {
        return fr.array(Entry, entries);
    }
};

const Entry = {
    read(bv: BinaryView) {
        const field = bv.uint8();
        return new OtMerg.Entry(
            new OtMerg.Flags((field & 0x01) !== 0, (field & 0x02) !== 0, (field & 0x04) !== 0),
            new OtMerg.Flags((field & 0x10) !== 0, (field & 0x20) !== 0, (field & 0x40) !== 0)
        );
    },
    write(fr: Frag, entry: OtMerg.Entry) {
        fr.uint8(
            (entry.ltr.merge ? 0x01 : 0) |
                (entry.ltr.group ? 0x02 : 0) |
                (entry.ltr.secondIsSubordinate ? 0x04 : 0) |
                (entry.rtl.merge ? 0x10 : 0) |
                (entry.rtl.group ? 0x20 : 0) |
                (entry.rtl.secondIsSubordinate ? 0x40 : 0)
        );
    }
};
