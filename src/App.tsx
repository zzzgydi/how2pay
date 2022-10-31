import { useEffect, useRef, useState } from "react";
import { toUnit } from "dinero.js";
import { cloneDeep } from "lodash-es";
import { useUpdateEffect } from "ahooks";
import { Button, Typography } from "@mui/material";
import { ShoppingCartRounded } from "@mui/icons-material";
import { tbCoupons } from "./utils/constant";
import { Goods } from "./components/Goods";
import { Coupon } from "./components/Coupon";
import { EditGoods, EditGoodsRef } from "./components/EditGoods";
import { EditCoupon, EditCouponRef } from "./components/EditCoupon";
import { how2pay } from "./utils/how2pay";
import { version } from "../package.json";

const TEMP_SAVE_GOODS = "temp_save_goods";
const TEMP_SAVE_COUPONS = "temp_save_coupons";

function App() {
  const [coupons, setCoupons] = useState<ICoupon[]>(tbCoupons);
  const [goods, setGoods] = useState<IGoods[]>([]);

  const [runResult, setRunResult] = useState<ReturnType<typeof how2pay> | null>(
    null
  );

  const editGoodsRef = useRef<EditGoodsRef>(null);
  const editCouponRef = useRef<EditCouponRef>(null);

  const selectedGoods = useRef<IGoods[]>([]);

  useEffect(() => {
    try {
      const str = localStorage.getItem(TEMP_SAVE_GOODS);
      const data = JSON.parse(str || "");
      if (str && Array.isArray(data)) {
        // 兼容没有id的情况
        setGoods(data.map((e) => ({ id: Math.random().toString(), ...e })));
      }
    } catch {}

    try {
      const str2 = localStorage.getItem(TEMP_SAVE_COUPONS);
      const data2 = JSON.parse(str2 || "");
      if (str2 && Array.isArray(data2)) {
        setCoupons(data2);
      }
    } catch {}
  }, []);

  useUpdateEffect(() => saveGoods(goods), [goods]);
  useUpdateEffect(() => saveCoupons(coupons), [coupons]);

  const handleCreateGoods = async () => {
    const item = await editGoodsRef.current?.create();
    if (item) {
      setGoods((g) => [...g, item]);
    }
  };

  const handleEditGoods = async (data: IGoods) => {
    const newData = await editGoodsRef.current?.edit(data);
    if (!newData) return;

    setGoods((list) => {
      let index = list.findIndex((e) => e.id === data.id);
      if (index < 0) {
        index = list.findIndex((e) => e.name === data.name);
      }
      if (index < 0) return list;
      const newList = [...list];
      newList.splice(index, 1, newData);
      return newList;
    });
  };

  const handleDeleteGoods = async (data: IGoods) => {
    setGoods((list) => list.filter((e) => e.name !== data.name));
  };

  const handleCreateCoupon = async () => {
    const data = await editCouponRef.current?.create();
    if (data) {
      setCoupons((list) => [...list, data]);
    }
  };

  const handleRun = async () => {
    const selected = selectedGoods.current;

    if (goods.length === 0) {
      window.alert("请添加商品");
      return;
    }
    if (selected.length === 0) {
      window.alert("请选择商品");
      return;
    }

    const fGoods = cloneDeep(selected);
    const fCoupons = cloneDeep(coupons);

    const result = how2pay(fGoods, fCoupons);
    console.log(result);
    setRunResult(result);
  };

  return (
    <div className="py-5 px-8 mx-auto" style={{ maxWidth: 1200 }}>
      <Typography variant="h4">How To Pay</Typography>
      <Typography variant="body1">Version: {version}</Typography>

      <div className="mt-4 mb-2 text-right flex gap-1 flex-wrap">
        <div className="flex-auto" />

        <Button variant="outlined" onClick={handleCreateCoupon}>
          添加优惠券
        </Button>

        <Button variant="outlined" onClick={handleCreateGoods}>
          添加商品
        </Button>

        <Button variant="contained" onClick={handleRun}>
          开始计算
        </Button>
      </div>

      {coupons.length === 0 && (
        <div className="my-3 py-10 w-full border rounded text-center text-sm">
          请添加优惠券
        </div>
      )}

      <div className="flex gap-2 py-3 my-3 flex-wrap">
        {coupons.map((coupon, index) => (
          <Coupon
            key={coupon.name}
            coupon={coupon}
            editable
            onEdit={async () => {
              const data = await editCouponRef.current?.edit(coupon);
              if (!data) return;
              setCoupons((list) => {
                const newList = [...list];
                newList.splice(index, 1, data);
                return newList;
              });
            }}
            onDelete={() => {
              setCoupons((list) => {
                const newList = [...list];
                newList.splice(index, 1);
                return newList;
              });
            }}
          />
        ))}
      </div>

      <div>
        <Goods
          goods={goods}
          onEdit={handleEditGoods}
          onDelete={handleDeleteGoods}
          onSelect={(g) => {
            selectedGoods.current = g;
          }}
        />
      </div>

      <div className="my-3 py-2 px-3 bg-amber-100 text-zinc-700 rounded-lg">
        注意: 各个优惠券和商品的名称不要重复！
      </div>

      {runResult && (
        <div className="my-5">
          <div className="text-2xl text-right mr-4">
            总价:
            <span className="ml-2 text-rose-600">
              ¥{toUnit(runResult.minPaid)}
            </span>
          </div>

          {runResult.groupsSave.map((groups, index) => (
            <div key={index + ""} className="my-2 py-2 px-4 border rounded-lg">
              <div className="mb-2 flex items-center flex-wrap gap-3">
                <span>分组 {index + 1}</span>
                <span className="text-sm text-slate-600">
                  原价: ¥{toUnit(runResult.resultSave[index].original)}
                </span>
                <span className="text-sm text-slate-600">
                  店铺优惠: ¥{toUnit(runResult.resultSave[index].shopSale)}
                </span>
                <span className="text-sm text-slate-600">
                  优惠券: ¥{toUnit(runResult.resultSave[index].couponTotal)}
                </span>
                <span className="text-sm text-slate-600">
                  优惠汇总: ¥{toUnit(runResult.resultSave[index].discount)}
                </span>
                <span className="text-sm text-slate-600">
                  定金: ¥{toUnit(runResult.resultSave[index].deposit)}
                </span>
                <span className="ml-auto text-lg text-rose-600">
                  ¥{toUnit(runResult.resultSave[index].payables)}
                </span>
              </div>

              {groups.map((item) => (
                <div
                  key={item.name}
                  className="my-1 flex items-center truncate"
                >
                  <ShoppingCartRounded
                    fontSize="small"
                    className="flex-none text-slate-400 mr-2"
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <EditGoods ref={editGoodsRef} coupons={coupons} />
      <EditCoupon ref={editCouponRef} />
    </div>
  );
}

export default App;

function saveGoods(goods: IGoods[]) {
  try {
    localStorage.setItem(TEMP_SAVE_GOODS, JSON.stringify(goods));
  } catch {}
}

function saveCoupons(coupons: ICoupon[]) {
  try {
    localStorage.setItem(TEMP_SAVE_COUPONS, JSON.stringify(coupons));
  } catch {}
}
