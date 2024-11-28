import { OtGlyph } from "@ot-builder/ot-glyphs";

import * as LayoutCommon from "../common";

export const Tag = "MERG";

export type ClassDef = LayoutCommon.ClassDef.T<OtGlyph>;

export class Table {
    constructor(
        public entries: Entry[][] = [],
        public classes: Map<OtGlyph, number>
    ) {}
}
export class Flags {
    constructor(
        public merge = false,
        public group = false,
        public secondIsSubordinate = false
    ) {}
}
export class Entry {
    constructor(
        public ltr = new Flags(),
        public rtl = new Flags()
    ) {}
}
