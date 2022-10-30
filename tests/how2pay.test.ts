import * as D from "dinero.js";
import { expect, it } from "vitest";
import { cloneDeep } from "lodash-es";
import { couponCalculator } from "../src/utils/calculator";
import { genFullSort, how2pay } from "../src/utils/how2pay";

const coupons: ICoupon[] = [
  {
    name: "满300减50",
    type: "target",
    order: 0,
    times: 99999,
    repeat: true,
    target: 300,
    reduce: 50,
  },
  {
    name: "购物券1200-110",
    type: "target",
    order: 1,
    times: 1,
    repeat: false,
    target: 1200,
    reduce: 110,
  },
  {
    name: "88vip打折",
    type: "sale",
    order: 3,
    times: 9999,
    repeat: false,
    target: 0,
    sale: 0.95,
  },
  {
    name: "88vip优惠套餐",
    type: "group",
    order: 4,
    times: 99,
    repeat: false,
    group: [
      {
        name: "6800-500",
        type: "target",
        times: 1,
        order: 0,
        repeat: false,
        target: 6800,
        reduce: 500,
      },
      {
        name: "3800-300",
        type: "target",
        times: 1,
        order: 0,
        repeat: false,
        target: 3800,
        reduce: 300,
      },
      {
        name: "1000-50",
        type: "target",
        times: 1,
        order: 0,
        repeat: false,
        target: 1000,
        reduce: 50,
      },
    ],
  },
];

const goods: IGoods[] = [
  {
    name: "bose",
    price: 1999,
    deposit: 100,
    shopSale: 0,
    coupons: ["满300减50", "88vip打折", "88vip优惠套餐"],
  },
  {
    name: "伊夫泉",
    price: 900,
    deposit: 50,
    shopSale: 451,
    coupons: ["满300减50", "购物券1200-110", "88vip优惠套餐"],
  },
  {
    name: "mac粉底液",
    price: 340,
    deposit: 50,
    shopSale: 0,
    coupons: ["88vip优惠套餐"],
  },
  {
    name: "修丽可",
    price: 595,
    deposit: 50,
    shopSale: 10,
    coupons: ["购物券1200-110", "88vip优惠套餐"],
  },
  {
    name: "自然堂面膜",
    price: 398,
    deposit: 40,
    shopSale: 150,
    coupons: ["满300减50", "88vip优惠套餐"],
  },
];

it("couponCalculator", () => {
  const map = cloneDeep(Object.fromEntries(coupons.map((e) => [e.name, e])));
  const result = couponCalculator(goods, map);

  expect(helpDebug(result)).toMatchSnapshot();
});

it("genGroups", () => {
  let i = 0;
  for (const group of genFullSort([1, 2, 3])) {
    console.log(++i, "\t", group);
  }
});

it("how2pay", () => {
  const result = how2pay(goods, cloneDeep(coupons));

  expect(helpDebug(result)).toMatchSnapshot();
});

function helpDebug(input: any): any {
  if (Array.isArray(input)) {
    return input.map((e) => helpDebug(e));
  } else if (typeof input === "object") {
    if (input.calculator && input.create && input.toJSON) {
      return D.toUnit(input);
    } else {
      return Object.fromEntries(
        Object.entries(input).map(([key, value]: any) => [
          key,
          helpDebug(value),
        ])
      );
    }
  }

  return input;
}
