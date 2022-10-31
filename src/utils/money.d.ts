interface ICoupon {
  name: string;
  type: "target" | "sale" | "group";
  order?: number; // 扣费顺序 >=0的数
  times?: number; // 可用次数
  repeat?: boolean; // 在一个分组里是否可以被多次使用
  target?: number; // 满减目标金额
  reduce?: number; // 满减减去的金额
  sale?: number; // 打折的那个啥 百分比
  group?: Omit<ICoupon, "group">[];
}

interface IGoods {
  id?: string;
  name: string;
  price: number; // 原价/总价
  deposit?: number; // 定金
  shopSale?: number; // 店铺优惠
  coupons?: string[]; // 支持的优惠券
  remark?: string; // 备注
}

type ICouponMap = Record<string, ICoupon>;
