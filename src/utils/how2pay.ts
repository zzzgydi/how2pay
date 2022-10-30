import * as D from "dinero.js";
import { cloneDeep } from "lodash-es";
import { couponCalculator, rmb } from "./calculator";

export function how2pay(goods: IGoods[], coupons: ICoupon[]) {
  const couponMap = Object.fromEntries(coupons.map((c) => [c.name, c]));

  let minPaid = rmb(1e9); // 10亿
  let groupsSave: IGoods[][] = [];
  let resultSave: ReturnType<typeof couponCalculator>[] = [];

  for (const groups of genGoodsGroup(goods)) {
    const map = cloneDeep(couponMap);

    let payables = rmb(0);

    const results = groups.map((group) => {
      const result = couponCalculator(group, map);
      payables = D.add(payables, result.payables);
      return result;
    });

    if (D.greaterThan(minPaid, payables)) {
      minPaid = payables;
      resultSave = results;
      groupsSave = groups;
    }

    console.log(D.toUnit(payables));
  }

  return {
    minPaid,
    resultSave,
    groupsSave,
  };
}

export function* genFullSort<T>(list: T[]): Generator<T[]> {
  const len = list.length;
  if (len === 1) {
    yield list;
  } else if (len === 2) {
    yield [list[0], list[1]];
    yield [list[1], list[0]];
  } else {
    for (let i = 0; i < len; i++) {
      const temp = [...list];
      const pre = temp[i];
      temp.splice(i, 1);

      for (const ret of genFullSort(temp)) {
        yield [pre, ...ret];
      }
    }
  }
}

export function* genGoodsGroup(goods: IGoods[]): Generator<IGoods[][]> {
  // 拿到所有的优惠券
  const allCoupons = [...new Set(goods.flatMap((g) => g.coupons || []))];

  const findIndex = (good: IGoods, coupons: string[]) => {
    return (
      good.coupons?.reduce((p, g) => {
        return Math.max(p, coupons.indexOf(g));
      }, -1) || -1
    );
  };

  // 不分组
  yield [[...goods]];

  // 按优惠券的来优先分组
  for (const coupons of genFullSort(allCoupons)) {
    const groups: IGoods[][] = [...coupons.map(() => []), []];

    goods.forEach((good) => {
      let index = findIndex(good, coupons);
      index = index === -1 ? coupons.length : index;
      groups[index].push(good);
    });

    yield groups.filter((g) => g.length > 0);
  }
}
