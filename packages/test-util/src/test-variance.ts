import { OtVar } from "@ot-builder/variance";

export namespace TestVariance {
    export function createWellKnownAxes() {
        const wght: OtVar.Dim = {
            tag: "wght",
            min: 100,
            default: 400,
            max: 900
        };
        const wdth: OtVar.Dim = {
            tag: "wdth",
            min: 25,
            default: 100,
            max: 200
        };
        const opsz: OtVar.Dim = {
            tag: "opsz",
            min: 6,
            default: 12,
            max: 72
        };

        return { wght, wdth, opsz };
    }
}
