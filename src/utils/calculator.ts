import * as D from "dinero.js";

const RMBCurrency = { code: "RMB", base: 10, exponent: 2 };

export type RMB = D.Dinero<number>;

export function rmb(amount: number = 0): RMB {
  return D.dinero({
    amount: Math.round(amount * 100),
    currency: RMBCurrency,
  });
}

export function couponCalculator(goods: IGoods[], couponMap: ICouponMap) {
  const findCouponsOriginal = () => {
    const names = goods.flatMap((e) => e.coupons || []);
    return [...new Set(names)]
      .map((name) => couponMap[name])
      .filter((c) => (c.order ?? 0) <= 1) // 基于原价的优惠
      .filter((c) => c.times && c.times > 0) // 次数得够
      .sort((a, b) => (a.order || 3) - (b.order || 3));
  };

  const findCouponsNotOriginal = () => {
    const names = goods.flatMap((e) => e.coupons || []);
    return [...new Set(names)]
      .map((name) => couponMap[name])
      .filter((c) => (c.order ?? 0) > 1) // 基于到手价的优惠
      .filter((c) => c.times && c.times > 0) // 次数得够
      .sort((a, b) => (a.order || 3) - (b.order || 3));
  };

  // 记录每轮的匹配情况
  const turnMatch: { coupon: string; save: RMB }[] = [];

  // 保存商品的总价优惠
  const saveMap = {} as Record<string, RMB>;

  // 第一轮，按 总价 计算优惠
  findCouponsOriginal().forEach((coupon) => {
    const { name } = coupon;
    // 找出能用这个优惠券的商品
    const goodsWithCou = goods.filter((g) => g.coupons?.includes(name));
    // 计算能用该优惠券的总价
    const sum = sumGoods(goodsWithCou);
    // 计算用了这个优惠券能省多少钱
    const save = calCoupon(coupon, sum);
    // 计算每个商品的优惠价格
    const allocate = D.allocate(
      save,
      goodsWithCou.map((g) => g.price)
    );

    goodsWithCou.forEach((good, index) => {
      const key = good.name;
      if (!saveMap[key]) saveMap[key] = allocate[index];
      else saveMap[key] = D.add(saveMap[key], allocate[index]);
    });

    // 记录使用的每个优惠券 和 每个优惠券能省的钱
    if (D.greaterThan(save, rmb(0))) {
      turnMatch.push({ coupon: name, save });
    }
  });

  // 第二轮，按 到手价 计算优惠
  findCouponsNotOriginal().forEach((coupon) => {
    const { name } = coupon;
    // 找出能用这个优惠券的商品
    const goodsWithCou = goods.filter((g) => g.coupons?.includes(name));
    // 计算能用该优惠券的总价
    const sum = sumGoods(goodsWithCou);
    // 计算已经优惠了多少
    const saleSum = D.add(
      sumList(goodsWithCou.map((g) => g.shopSale || 0)),
      goodsWithCou
        .map((g) => saveMap[g.name] || rmb(0))
        .reduce((p, n) => D.add(p, n), rmb(0))
    );
    // 计算用了这个优惠券能省多少钱
    const save = calCoupon(coupon, D.subtract(sum, saleSum));

    // 记录使用的每个优惠券 和 每个优惠券能省的钱
    if (D.greaterThan(save, rmb(0))) {
      turnMatch.push({ coupon: name, save });
    }
  });

  // 原始总价
  const original = sumGoods(goods);

  // 店铺优惠
  const shopSale = sumList(goods.map((g) => g.shopSale || 0));

  // 所有优惠券的优惠价
  const couponTotal = sumRMB(turnMatch.map((e) => e.save));

  // 各种优惠的总和
  const discount = sumRMB([shopSale, couponTotal]);

  // 已付定金
  const deposit = sumList(goods.map((g) => g.deposit || 0));

  const payables = D.subtract(D.subtract(original, deposit), discount);

  return {
    original,
    discount,
    shopSale,
    couponTotal,
    deposit,
    payables,
    turnMatch,
  };
}

// 计算这个价格用这个优惠券，能优惠多少
function calCoupon(coupon: ICoupon, price: RMB): RMB {
  let save = rmb(0);

  const { type } = coupon;
  const target = rmb(coupon.target);
  const noTarget = !coupon.target || coupon.target <= 0;

  // 满减
  if (
    type === "target" &&
    !noTarget &&
    D.greaterThanOrEqual(price, target) &&
    coupon.times &&
    coupon.times > 0
  ) {
    // 一个优惠券允许多次使用
    if (coupon.repeat) {
      const temp = D.toUnit(price) / D.toUnit(target);
      const times = Math.min(coupon.times, Math.floor(temp));
      save = D.multiply(rmb(coupon.reduce), times);
      coupon.times -= times; // 优惠券减去用的次数
    }
    // 优惠券只能用一次
    else {
      save = rmb(coupon.reduce || 0);
      coupon.times -= 1;
    }
  }
  // 打折
  else if (type === "sale" && coupon.sale && coupon.sale > 0) {
    // 万一有些优惠券还需要到达多少钱才能打折
    if (noTarget || D.greaterThanOrEqual(price, target)) {
      // 这里淘宝的计算是去掉小数点后两位
      // 所以要转成number计算
      save = rmb(D.toUnit(price) * (1 - coupon.sale));
    }
  }
  // 并列的
  else if (type === "group" && coupon.group?.length) {
    // 分组一定得是满减的，按减的价格最高来降序
    const groups = coupon.group
      .filter((e) => e.type === "target" && e.target && e.reduce)
      .sort((a, b) => a.reduce! - b.reduce!);

    for (const cou of groups) {
      save = calCoupon(cou, price);
      if (D.greaterThan(save, rmb(0))) {
        break;
      }
    }
  }

  return save;
}

// 原价
function sumGoods(goodsList: IGoods[]): RMB {
  return goodsList.reduce((sum, goods) => D.add(sum, rmb(goods.price)), rmb(0));
}

function sumList(list: number[]): RMB {
  return list.reduce((p, n) => D.add(p, rmb(n)), rmb(0));
}

function sumRMB(list: RMB[]): RMB {
  return list.reduce((p, n) => D.add(p, n), rmb(0));
}
