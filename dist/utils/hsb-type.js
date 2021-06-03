"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HSBType = void 0;
const js_big_decimal_1 = __importDefault(require("js-big-decimal"));
class HSBType {
    /**
     * Constructs a HSBType instance with the given values
     *
     * @param h the hue value in the range from 0 <= h < 360
     * @param s the saturation as a percent value
     * @param b the brightness as a percent value
     */
    constructor(h, s, b) {
        this.hue = h;
        this.brightness = b;
        this.saturation = s;
        this.validateValue(this.hue, this.saturation, this.brightness);
    }
    static valueOf(value) {
        const hsb = value.split(',').map(s => Number(s.trim()));
        if (hsb.length === 3) {
            return new HSBType(hsb[0], hsb[1], hsb[2]);
        }
        throw new Error('You must pass three comma separated values (H, S, B)');
    }
    /**
     * Create HSB from RGB
     *
     * @param r red 0-255
     * @param g green 0-255
     * @param b blue 0-255
     */
    static fromRGB(r, g, b) {
        let tmpHue;
        let max = r > g ? r : g;
        if (b > max) {
            max = b;
        }
        let min = r < g ? r : g;
        if (b < min) {
            min = b;
        }
        const tmpBrightness = max / 2.55;
        const tmpSaturation = (max != 0 ? (max - min) / max : 0) * 100;
        if (tmpSaturation == 0) {
            tmpHue = 0;
        }
        else {
            const red = (max - r) / (max - min);
            const green = (max - g) / (max - min);
            const blue = (max - b) / (max - min);
            if (r == max) {
                tmpHue = blue - green;
            }
            else if (g == max) {
                tmpHue = 2.0 + red - blue;
            }
            else {
                tmpHue = 4.0 + green - red;
            }
            tmpHue = (tmpHue / 6.0) * 360;
            if (tmpHue < 0) {
                tmpHue = tmpHue + 360.0;
            }
        }
        return new HSBType(tmpHue, tmpSaturation, tmpBrightness);
    }
    /**
     * Returns a HSBType object representing the provided xy color values in CIE XY color model.
     * Conversion from CIE XY color model to sRGB using D65 reference white
     * Returned color is set to full brightness
     *
     * @param x, y color information 0.0 - 1.0
     * @return new HSBType object representing the given CIE XY color, full brightness
     */
    static fromXY(x, y, Y) {
        const tmpY = Y || 1.0;
        const tmpX = (tmpY / y) * x;
        const tmpZ = (tmpY / y) * (1.0 - x - y);
        let r = tmpX * HSBType.XY2RGB[0][0] + tmpY * HSBType.XY2RGB[0][1] + tmpZ * HSBType.XY2RGB[0][2];
        let g = tmpX * HSBType.XY2RGB[1][0] + tmpY * HSBType.XY2RGB[1][1] + tmpZ * HSBType.XY2RGB[1][2];
        let b = tmpX * HSBType.XY2RGB[2][0] + tmpY * HSBType.XY2RGB[2][1] + tmpZ * HSBType.XY2RGB[2][2];
        let max = r > g ? r : g;
        if (b > max) {
            max = b;
        }
        r = this.gammaCompress(r / max);
        g = this.gammaCompress(g / max);
        b = this.gammaCompress(b / max);
        return HSBType.fromRGB(Math.floor(r * 255.0 + 0.5), Math.floor(g * 255.0 + 0.5), Math.floor(b * 255.0 + 0.5));
    }
    // Gamma compression (sRGB) for a single component, in the 0.0 - 1.0 range
    static gammaCompress(c) {
        if (c < 0.0) {
            c = 0.0;
        }
        else if (c > 1.0) {
            c = 1.0;
        }
        return c <= 0.0031308 ? 12.92 * c : (1.0 + 0.055) * Math.pow(c, 1.0 / 2.4) - 0.055;
    }
    // Gamma decompression (sRGB) for a single component, in the 0.0 - 1.0 range
    static gammaDecompress(c) {
        if (c < 0.0) {
            c = 0.0;
        }
        else if (c > 1.0) {
            c = 1.0;
        }
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / (1.0 + 0.055), 2.4);
    }
    getRed() {
        return this.toRGB()[0];
    }
    getGreen() {
        return this.toRGB()[1];
    }
    getBlue() {
        return this.toRGB()[2];
    }
    /**
     * Returns the RGB value representing the color in the default sRGB
     * color model.
     * (Bits 24-31 are alpha, 16-23 are red, 8-15 are green, 0-7 are blue).
     *
     * @return the RGB value of the color in the default sRGB color model
     */
    getRGB() {
        const rgb = this.toRGB();
        return ((0xff << 24) |
            ((this.convertPercentToByte(rgb[0]) & 0xff) << 16) |
            ((this.convertPercentToByte(rgb[1]) & 0xff) << 8) |
            ((this.convertPercentToByte(rgb[2]) & 0xff) << 0));
    }
    toString() {
        return this.toFullString();
    }
    toFullString() {
        return `${this.hue},${this.saturation},${this.brightness}`;
    }
    toRGB() {
        let red = null;
        let green = null;
        let blue = null;
        const ONE_HUNDRED = new js_big_decimal_1.default(100);
        const h = new js_big_decimal_1.default(this.hue).divide(ONE_HUNDRED, 6).round(4);
        const s = Number(new js_big_decimal_1.default(this.saturation).divide(ONE_HUNDRED, 6).getValue());
        const v = new js_big_decimal_1.default(this.brightness);
        const hInt = Math.floor(Number(h
            .multiply(new js_big_decimal_1.default(5))
            .divide(new js_big_decimal_1.default(3), 6)
            .getValue()));
        const f = Number(h
            .multiply(new js_big_decimal_1.default(5))
            .divide(new js_big_decimal_1.default(3), 6)
            .round(4)
            .getValue()) % 1;
        const a = Number(v
            .multiply(new js_big_decimal_1.default(1 - s))
            .round(4, js_big_decimal_1.default.RoundingModes.HALF_UP)
            .getValue());
        const b = Number(v.multiply(new js_big_decimal_1.default(1 - s * f)).getValue());
        const c = Number(v.multiply(new js_big_decimal_1.default(1 - s * (1 - f))).getValue());
        switch (hInt) {
            case 0:
            case 6:
                red = this.brightness;
                green = c;
                blue = a;
                break;
            case 1:
                red = b;
                green = this.brightness;
                blue = a;
                break;
            case 2:
                red = a;
                green = this.brightness;
                blue = c;
                break;
            case 3:
                red = a;
                green = b;
                blue = this.brightness;
                break;
            case 4:
                red = c;
                green = a;
                blue = this.brightness;
                break;
            case 5:
                red = this.brightness;
                green = a;
                blue = b;
                break;
        }
        return [Math.round(red), Math.round(green), Math.round(blue)];
    }
    toRGBBytes() {
        const [red, green, blue] = this.toRGB();
        return [
            this.convertPercentToByte(red),
            this.convertPercentToByte(green),
            this.convertPercentToByte(blue),
        ];
    }
    /**
     * Returns the xyY values representing this object's color in CIE XY color model.
     * Conversion from sRGB to CIE XY using D65 reference white
     * xy pair contains color information
     * Y represents relative luminance
     *
     * @param HSBType color object
     * @return PercentType[x, y, Y] values in the CIE XY color model
     */
    toXY() {
        // This makes sure we keep color information even if brightness is zero
        const sRGB = new HSBType(this.hue, this.saturation, 100).toRGB();
        const r = HSBType.gammaDecompress(sRGB[0] / 100.0);
        const g = HSBType.gammaDecompress(sRGB[1] / 100.0);
        const b = HSBType.gammaDecompress(sRGB[2] / 100.0);
        const tmpX = r * HSBType.RGB2XY[0][0] + g * HSBType.RGB2XY[0][1] + b * HSBType.RGB2XY[0][2];
        const tmpY = r * HSBType.RGB2XY[1][0] + g * HSBType.RGB2XY[1][1] + b * HSBType.RGB2XY[1][2];
        const tmpZ = r * HSBType.RGB2XY[2][0] + g * HSBType.RGB2XY[2][1] + b * HSBType.RGB2XY[2][2];
        const x = tmpX / (tmpX + tmpY + tmpZ);
        const y = tmpY / (tmpX + tmpY + tmpZ);
        return [x * 100.0, y * 100.0, tmpY * this.brightness];
    }
    validateValue(hue, saturation, brightness) {
        if (hue < 0 || hue > 360) {
            throw new Error('Hue must be between 0 and 360');
        }
        if (saturation < 0 || saturation > 100) {
            throw new Error('Saturation must be between 0 and 100');
        }
        if (brightness < 0 || brightness > 100) {
            throw new Error('Brightness must be between 0 and 100');
        }
    }
    convertPercentToByte(percent) {
        return Math.round(percent * (255 / 100));
    }
}
exports.HSBType = HSBType;
// constants for the constituents
// constants for colors
HSBType.BLACK = new HSBType(0, 0, 0);
HSBType.WHITE = new HSBType(0, 0, 100);
HSBType.RED = new HSBType(0, 100, 100);
HSBType.GREEN = new HSBType(120, 100, 100);
HSBType.BLUE = new HSBType(240, 100, 100);
// 1931 CIE XYZ to sRGB (D65 reference white)
HSBType.XY2RGB = [
    [3.2406, -1.5372, -0.4986],
    [-0.9689, 1.8758, 0.0415],
    [0.0557, -0.204, 1.057],
];
// sRGB to 1931 CIE XYZ (D65 reference white)
HSBType.RGB2XY = [
    [0.4124, 0.3576, 0.1805],
    [0.2126, 0.7152, 0.0722],
    [0.0193, 0.1192, 0.9505],
];
//# sourceMappingURL=hsb-type.js.map