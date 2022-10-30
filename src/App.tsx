import { Button, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { Goods } from "./components/Goods";
import { EditGoods, EditGoodsRef } from "./components/EditGoods";
import { tbCoupons } from "./utils/constant";
import { Coupon } from "./components/Coupon";

function App() {
  const [coupons, setCoupons] = useState<ICoupon[]>(tbCoupons);
  const [goods, setGoods] = useState<IGoods[]>([]);

  const editGoodsRef = useRef<EditGoodsRef>(null);

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

  return (
    <div className="py-5 px-8 mx-auto" style={{ maxWidth: 1200 }}>
      <Typography variant="h3">How To Pay</Typography>

      <div className="mt-4 mb-2 text-right flex gap-1">
        <Button variant="contained" className="ml-auto">
          添加优惠券
        </Button>

        <Button variant="contained" onClick={handleCreateGoods}>
          添加商品
        </Button>

        <Button variant="contained">开始计算</Button>
      </div>

      <div className="flex gap-2 py-3 my-4">
        {coupons.length === 0 && (
          <div className="py-10 w-full border rounded text-center text-sm">
            请添加优惠券
          </div>
        )}

        {coupons.map((coupon) => (
          <Coupon coupon={coupon} editable />
        ))}
      </div>

      <div>
        <Goods goods={goods} onChange={setGoods} onEdit={handleEditGoods} />
      </div>

      <EditGoods ref={editGoodsRef} />
    </div>
  );
}

export default App;
