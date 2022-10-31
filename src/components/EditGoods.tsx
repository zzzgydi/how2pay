import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";

export interface EditGoodsRef {
  edit: (data: IGoods) => Promise<IGoods>;
  create: () => Promise<IGoods>;
}

interface Props {
  coupons: ICoupon[];
}

export const EditGoods = forwardRef<EditGoodsRef, Props>((props, ref) => {
  const { coupons } = props;

  const [type, setType] = useState("new");
  const [open, setOpen] = useState(false);

  const promiseRef = useRef<{
    resolve: (data: IGoods) => void;
    reject: () => void;
  }>();

  const { control, ...formIns } = useForm<IGoods>({
    defaultValues: {
      name: "这是商品名称",
      deposit: 0,
      price: 10,
      shopSale: 0,
      remark: "",
      coupons: [],
    },
  });

  useImperativeHandle(ref, () => ({
    edit: async (data: IGoods) => {
      return new Promise((resolve, reject) => {
        setOpen(true);
        setType("edit");
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            formIns.setValue(key as any, value);
          });
        }
        promiseRef.current = { resolve, reject };
      });
    },
    create: async () => {
      return new Promise((resolve, reject) => {
        setOpen(true);
        setType("new");
        promiseRef.current = { resolve, reject };
      });
    },
  }));

  const handleClose = () => {
    setOpen(false);
    promiseRef.current?.reject();
    promiseRef.current = null!;
    setTimeout(() => formIns.reset(), 250);
  };

  const handleSubmit = () => {
    formIns.handleSubmit((data) => {
      promiseRef.current?.resolve({ id: Math.random().toString(), ...data });
      promiseRef.current = null!;
      setOpen(false);
      setTimeout(() => formIns.reset(), 250);
      console.log(data);
    })();
  };

  const textProps = {
    variant: "standard",
    fullWidth: true,
    sx: { mb: 1 },
    autoComplete: "off",
  } as const;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {type === "new" ? "添加商品" : "编辑商品"}
      </DialogTitle>

      <DialogContent sx={{ pb: 1, maxHeight: 520 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField {...textProps} {...field} label="商品名称" />
          )}
        />

        <Controller
          name="deposit"
          control={control}
          render={({ field }) => (
            <TextField {...textProps} {...field} label="定金" type="number" />
          )}
        />

        <Controller
          name="shopSale"
          control={control}
          render={({ field }) => (
            <TextField
              {...textProps}
              {...field}
              label="店铺优惠"
              type="number"
            />
          )}
        />

        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <TextField {...textProps} {...field} label="总价" type="number" />
          )}
        />

        <Controller
          name="coupons"
          control={control}
          render={({ field }) => (
            <FormControl {...textProps}>
              <InputLabel>优惠券</InputLabel>
              <Select {...field} multiple renderValue={(v) => v.join(", ")}>
                {coupons.map((item) => (
                  <MenuItem key={item.name} value={item.name}>
                    <ListItemText primary={item.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="remark"
          control={control}
          render={({ field }) => (
            <TextField {...textProps} {...field} label="备注" />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleSubmit}>确认</Button>
      </DialogActions>
    </Dialog>
  );
});
