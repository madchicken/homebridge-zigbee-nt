import { HSBType } from '../hsb-type';

describe('HSB Type', () => {
  it('should convert HSB to RGB', () => {
    expect(new HSBType(0, 100, 100).toRGBBytes()).toStrictEqual([255, 0, 0]); // red
    expect(new HSBType(0, 0, 0).toRGBBytes()).toStrictEqual([0, 0, 0]); // black
    expect(new HSBType(0, 0, 100).toRGBBytes()).toStrictEqual([255, 255, 255]); // white
    expect(new HSBType(120, 100, 100).toRGBBytes()).toStrictEqual([0, 255, 0]); // green
    expect(new HSBType(240, 100, 100).toRGBBytes()).toStrictEqual([0, 0, 255]); // blue
    expect(new HSBType(229, 37, 62).toRGBBytes()).toStrictEqual([99, 110, 158]); // blueish
    expect(new HSBType(316, 69, 47).toRGBBytes()).toStrictEqual([120, 38, 97]); // purple
    expect(new HSBType(60, 60, 60).toRGBBytes()).toStrictEqual([153, 153, 61]); // green
    expect(new HSBType(300, 100, 40).toRGBBytes()).toStrictEqual([102, 0, 102]);
  });
});
