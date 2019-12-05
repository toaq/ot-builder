import { Access } from "@ot-builder/prelude";

import { OtGlyph } from "../ot-glyph";

export interface PointSink {
    addControlKnot(knot: OtGlyph.Point): void;
}

export interface StatGeometryVisitor<T> extends OtGlyph.GeometryVisitor {
    getResult(): T;
}
export interface StatGeometryVisitorClass<T> {
    new (): StatGeometryVisitor<T>;
}

export class PointTransformer<PS extends PointSink> {
    constructor(readonly ps: PS, readonly tf: (z: OtGlyph.Point) => OtGlyph.Point) {}
    public addControlKnot(knot: OtGlyph.Point) {
        this.ps.addControlKnot(this.tf(knot));
    }
    public wrap(tf1: (z: OtGlyph.Point) => OtGlyph.Point) {
        const tf = this.tf;
        return new PointTransformer<PS>(this.ps, z => tf1(tf(z)));
    }
    public coWrap(tf1: (z: OtGlyph.Point) => OtGlyph.Point) {
        const tf = this.tf;
        return new PointTransformer<PS>(this.ps, z => tf(tf1(z)));
    }
}

export class OtGhPointHandlerT<PS extends PointSink> implements OtGlyph.GeometryVisitor {
    constructor(protected readonly acc: PointTransformer<PS>) {}
    public begin() {}
    public end() {}
    public visitReference(g: OtGlyph.ReferenceGeometry) {
        g.acceptReferenceVisitor(new RefHandler(this.acc));
    }
    public visitContourSet(g: OtGlyph.ContourSetGeometry) {
        g.acceptContourSetVisitor(new ContourSetHandler(this.acc));
    }
}

class ContourSetHandler<PS extends PointSink> implements OtGlyph.ContourSetVisitor {
    constructor(private readonly acc: PointTransformer<PS>) {}
    public begin() {}
    public visitContourSet(s: OtGlyph.ContourSetGeometry) {
        for (const contour of s.listContours()) {
            contour.acceptContourVisitor(new ContourHandler(this.acc));
        }
    }
    public end() {}
}

class ContourHandler<PS extends PointSink> implements OtGlyph.ContourVisitor {
    constructor(private readonly acc: PointTransformer<PS>) {}
    public begin() {}
    public end() {}
    public visitContour(s: OtGlyph.ContourShape) {
        for (const z of s.listPoints()) this.acc.addControlKnot(z);
    }
}

class RefHandler<PS extends PointSink> implements OtGlyph.ReferenceVisitor {
    constructor(private readonly acc: PointTransformer<PS>) {}
    private target: null | OtGlyph = null;
    private transform: null | OtGlyph.Transform2X3 = null;
    public begin() {}
    public end() {
        if (!this.target || !this.transform) return;
        const target = this.target;
        const transform = this.transform;
        const plRef = new OtGhPointHandlerT(
            this.acc.coWrap(z => OtGlyph.PointOps.applyTransform(z, transform))
        );
        target.acceptGeometryVisitor(plRef);
    }
    public visitTarget(g: Access<OtGlyph>) {
        this.target = g.get();
    }
    public visitTransform(t: Access<OtGlyph.Transform2X3>) {
        this.transform = t.get();
    }
    public setPointAttachment() {}
    public setFlag() {}
}
