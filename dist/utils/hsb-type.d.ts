export declare class HSBType {
    static BLACK: HSBType;
    static WHITE: HSBType;
    static RED: HSBType;
    static GREEN: HSBType;
    static BLUE: HSBType;
    private static XY2RGB;
    private static RGB2XY;
    hue: number;
    saturation: number;
    brightness: number;
    /**
     * Constructs a HSBType instance with the given values
     *
     * @param h the hue value in the range from 0 <= h < 360
     * @param s the saturation as a percent value
     * @param b the brightness as a percent value
     */
    constructor(h: number, s: number, b: number);
    static valueOf(value: string): HSBType;
    /**
     * Create HSB from RGB
     *
     * @param r red 0-255
     * @param g green 0-255
     * @param b blue 0-255
     */
    static fromRGB(r: number, g: number, b: number): HSBType;
    /**
     * Returns a HSBType object representing the provided xy color values in CIE XY color model.
     * Conversion from CIE XY color model to sRGB using D65 reference white
     * Returned color is set to full brightness
     *
     * @param x, y color information 0.0 - 1.0
     * @return new HSBType object representing the given CIE XY color, full brightness
     */
    static fromXY(x: number, y: number, Y?: number): HSBType;
    private static gammaCompress;
    private static gammaDecompress;
    getRed(): number;
    getGreen(): number;
    getBlue(): number;
    /**
     * Returns the RGB value representing the color in the default sRGB
     * color model.
     * (Bits 24-31 are alpha, 16-23 are red, 8-15 are green, 0-7 are blue).
     *
     * @return the RGB value of the color in the default sRGB color model
     */
    getRGB(): number;
    toString(): string;
    toFullString(): string;
    toRGB(): number[];
    toRGBBytes(): number[];
    /**
     * Returns the xyY values representing this object's color in CIE XY color model.
     * Conversion from sRGB to CIE XY using D65 reference white
     * xy pair contains color information
     * Y represents relative luminance
     *
     * @param HSBType color object
     * @return PercentType[x, y, Y] values in the CIE XY color model
     */
    toXY(): number[];
    private validateValue;
    convertPercentToByte(percent: number): number;
}
//# sourceMappingURL=hsb-type.d.ts.map