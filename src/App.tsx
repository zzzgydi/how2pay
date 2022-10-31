import { useEffect, useRef, useState } from "react";
import { Button, Typography } from "@mui/material";
import { tbCoupons } from "./utils/constant";
import { Goods } from "./components/Goods";
import { Coupon } from "./components/Coupon";
import { EditGoods, EditGoodsRef } from "./components/EditGoods";
import { EditCoupon, EditCouponRef } from "./components/EditCoupon";
import { cloneDeep } from "lodash-es";
import { how2pay } from "./utils/how2pay";
import { useUpdateEffect } from "ahooks";
import { toUnit } from "dinero.js";

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

  useEffect(() => {
    try {
      const str = localStorage.getItem(TEMP_SAVE_GOODS);
      const data = JSON.parse(str || "");
      if (str && Array.isArray(data)) {
        setGoods(data);
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
      const index = list.findIndex((e) => e.id === data.id);

      if (index < 0) return list;
      const newList = [...list];
      newList.splice(index, 1, {
        ...newData,
        id: Math.random().toString(),
      });

      return newList;
    });
  };

  const handleCreateCoupon = async () => {
    const data = await editCouponRef.current?.create();
    if (data) {
      setCoupons((list) => [...list, data]);
    }
  };

  const handleRun = async () => {
    const fGoods = cloneDeep(goods);
    const fCoupons = cloneDeep(coupons);

    const result = how2pay(fGoods, fCoupons);
    console.log(result);
    setRunResult(result);
  };

  return (
    <div className="py-5 px-8 mx-auto" style={{ maxWidth: 1200 }}>
      <Typography variant="h3">How To Pay</Typography>

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
        <div className="my-4 py-10 w-full border rounded text-center text-sm">
          请添加优惠券
        </div>
      )}

      <div className="flex gap-2 py-3 my-4 flex-wrap">
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
        <Goods goods={goods} onChange={setGoods} onEdit={handleEditGoods} />
      </div>

      {runResult && (
        <div className="my-5">
          <Typography variant="h5">
            总价: ${toUnit(runResult.minPaid)}
          </Typography>

          {runResult.groupsSave.map((groups, index) => (
            <div key={index + ""}>
              {groups.map((item) => (
                <div key={item.name}>{item.name}</div>
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
