import { RectifyImpl } from "@ot-builder/common-impl";
import * as Ot from "@ot-builder/font";
import { Rectify } from "@ot-builder/prelude";

function inPlaceRectifyCoordPrivateDict(
    rec: Rectify.Coord.RectifierT<Ot.Var.Value>,
    pd: Ot.Cff.PrivateDict
) {
    pd.blueValues = RectifyImpl.Coord.list(rec, pd.blueValues);
    pd.otherBlues = RectifyImpl.Coord.list(rec, pd.otherBlues);
    pd.familyBlues = RectifyImpl.Coord.list(rec, pd.familyBlues);
    pd.familyOtherBlues = RectifyImpl.Coord.list(rec, pd.familyOtherBlues);
    pd.stemSnapH = RectifyImpl.Coord.list(rec, pd.stemSnapH);
    pd.stemSnapV = RectifyImpl.Coord.list(rec, pd.stemSnapV);
    pd.blueScale = rec.coord(pd.blueScale);
    pd.blueShift = rec.coord(pd.blueShift);
    pd.blueFuzz = rec.coord(pd.blueFuzz);
    pd.stdHW = rec.coord(pd.stdHW);
    pd.stdVW = rec.coord(pd.stdVW);
    pd.expansionFactor = rec.coord(pd.expansionFactor);
}

function inPlaceRectifyCoordFontDict(
    rec: Rectify.Coord.RectifierT<Ot.Var.Value>,
    fd: Ot.Cff.FontDict
) {
    if (fd.privateDict) inPlaceRectifyCoordPrivateDict(rec, fd.privateDict);
}

export function inPlaceRectifyCoordCffTable(
    rec: Rectify.Coord.RectifierT<Ot.Var.Value>,
    table: Ot.Cff.Table
) {
    inPlaceRectifyCoordFontDict(rec, table.topDict);
    if (table.fdArray) for (const fd of table.fdArray) inPlaceRectifyCoordFontDict(rec, fd);
}

export function inPlaceRectifyGlyphCID(rec: Rectify.Glyph.RectifierT<Ot.Glyph>, cid: Ot.Cff.CID) {
    if (cid.mapping) cid.mapping = RectifyImpl.Glyph.comapSome(rec, cid.mapping);
}

export function inPlaceRectifyGlyphCffTable(
    rec: Rectify.Glyph.RectifierT<Ot.Glyph>,
    table: Ot.Cff.Table
) {
    if (table.cid) inPlaceRectifyGlyphCID(rec, table.cid);
    if (table.fdSelect) table.fdSelect = RectifyImpl.Glyph.mapSome(rec, table.fdSelect);
}
