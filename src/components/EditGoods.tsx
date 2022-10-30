import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

export interface EditGoodsRef {
  edit: (data: IGoods) => Promise<IGoods>;
  create: () => Promise<IGoods>;
}

export const EditGoods = forwardRef<EditGoodsRef>((props, ref) => {
  const [type, setType] = useState("new");
  const [open, setOpen] = useState(false);
  const [goods, setGoods] = useState<Partial<IGoods>>({});

  const promiseRef = useRef<{
    resolve: (data: IGoods) => void;
    reject: () => void;
  }>();

  useImperativeHandle(ref, () => ({
    edit: async (data: IGoods) => {
      return new Promise((resolve, reject) => {
        setGoods({ ...data });
        setOpen(true);
        setType("edit");
        promiseRef.current = { resolve, reject };
      });
    },
    create: async () => {
      return new Promise((resolve, reject) => {
        setGoods({});
        setOpen(true);
        setType("new");
        promiseRef.current = { resolve, reject };
      });
    },
  }));

  const textProps = {
    variant: "standard",
    fullWidth: true,
    sx: { mb: 1 },
  } as const;

  const handleClose = () => {
    setOpen(false);
    setGoods({});
    promiseRef.current?.reject();
    promiseRef.current = null!;
  };

  const handleSubmit = () => {
    promiseRef.current?.resolve({
      id: Math.random().toString(),
      ...goods,
      name: goods.name!,
      deposit: +goods.deposit! || 0,
      shopSale: +goods.shopSale! || 0,
      price: +goods.price! || 0,
    });
    setOpen(false);
    setGoods({});
    promiseRef.current = null!;
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 0 }}>
        {type === "new" ? "新增商品" : "编辑商品"}
      </DialogTitle>

      <DialogContent sx={{ width: 500, pb: 1 }}>
        <TextField
          {...textProps}
          label="商品名称"
          value={goods.name ?? ""}
          onChange={(e) => {
            setGoods((o) => ({ ...o, name: e.target.value }));
          }}
        />

        <TextField
          {...textProps}
          label="定金"
          type="number"
          value={goods.deposit ?? ""}
          onChange={(e) => {
            setGoods((o) => ({ ...o, deposit: e.target.value as any }));
          }}
        />

        <TextField
          {...textProps}
          label="店铺优惠"
          type="number"
          value={goods.shopSale ?? ""}
          onChange={(e) => {
            setGoods((o) => ({ ...o, shopSale: e.target.value as any }));
          }}
        />

        <TextField
          {...textProps}
          label="总价"
          type="number"
          value={goods.price ?? ""}
          onChange={(e) => {
            setGoods((o) => ({ ...o, price: e.target.value as any }));
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleSubmit}>确认</Button>
      </DialogActions>
    </Dialog>
  );
});
