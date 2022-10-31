import { useRef, useState } from "react";
import { Button, Typography } from "@mui/material";
import { tbCoupons } from "./utils/constant";
import { Goods } from "./components/Goods";
import { Coupon } from "./components/Coupon";
import { EditGoods, EditGoodsRef } from "./components/EditGoods";
import { EditCoupon, EditCouponRef } from "./components/EditCoupon";

function App() {
  const [coupons, setCoupons] = useState<ICoupon[]>(tbCoupons);
  const [goods, setGoods] = useState<IGoods[]>([]);

  const editGoodsRef = useRef<EditGoodsRef>(null);
  const editCouponRef = useRef<EditCouponRef>(null);

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

        <Button variant="contained">开始计算</Button>
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

      <EditGoods ref={editGoodsRef} coupons={coupons} />
      <EditCoupon ref={editCouponRef} />
    </div>
  );
}

export default App;
