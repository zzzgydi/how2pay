import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputLabel,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { RemoveCircleRounded } from "@mui/icons-material";
import * as R from "./render";

export interface EditCouponRef {
  edit: (data: ICoupon) => Promise<ICoupon>;
  create: () => Promise<ICoupon>;
}

export const EditCoupon = forwardRef<EditCouponRef>((props, ref) => {
  const [type, setType] = useState("new");
  const [open, setOpen] = useState(false);

  const promiseRef = useRef<{
    resolve: (data: ICoupon) => void;
    reject: () => void;
  }>();

  const { control, watch, ...formIns } = useForm<ICoupon>({
    defaultValues: {
      name: "这是优惠券名称",
      type: "target",
      order: 1,
      target: 100,
      reduce: 0,
      times: 1,
      sale: 0.95,
      group: [],
    },
  });
  const groupField = useFieldArray({ control, name: "group" });
  const couponType = watch("type");

  useImperativeHandle(ref, () => ({
    edit: async (data: ICoupon) => {
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

  const handleOk = () => {
    formIns.handleSubmit((data) => {
      promiseRef.current?.resolve(data);
      promiseRef.current = null!;
      setOpen(false);
      setTimeout(() => formIns.reset(), 250);
      console.log(data);
    })();
  };

  const handleGroupAppend = () => {
    const groupName = watch("name");
    const index = groupField.fields.length + 1;
    const name = `${groupName}-${index}`;
    groupField.append({
      name,
      type: "target",
      order: 3,
      target: 100,
      reduce: 0,
      repeat: false,
      times: 1,
    });
  };

  const textProps = {
    variant: "standard",
    fullWidth: true,
    sx: { mb: 1.5 },
    autoComplete: "off",
  } as const;

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {type === "new" ? "添加优惠券" : "编辑优惠券"}
      </DialogTitle>

      <DialogContent sx={{ pb: 1, maxWidth: 666, maxHeight: 520 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field }) => R.renderName(textProps, field)}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => R.renderType(textProps, field)}
        />
        <Controller
          name="order"
          control={control}
          render={({ field }) => R.renderOrder(textProps, field)}
        />

        {couponType === "target" && (
          <>
            <Controller
              name="target"
              control={control}
              render={({ field }) => R.renderTarget(textProps, field)}
            />
            <Controller
              name="reduce"
              control={control}
              render={({ field }) => R.renderReduce(textProps, field)}
            />
          </>
        )}

        {couponType === "sale" && (
          <>
            <Controller
              name="sale"
              control={control}
              render={({ field }) => R.renderSale(textProps, field)}
            />
            <Controller
              name="target"
              control={control}
              render={({ field }) => R.renderSaleTarget(textProps, field)}
            />
          </>
        )}

        {/* 分组没这些 */}
        {couponType !== "group" && (
          <>
            <Controller
              name="times"
              control={control}
              render={({ field }) => R.renderTimes(textProps, field)}
            />
            <Controller
              name="repeat"
              control={control}
              render={({ field }) => R.renderRepeat({}, field)}
            />
          </>
        )}

        {couponType === "group" && (
          <>
            <div className="flex items-center justify-between mt-2 mb-3">
              <InputLabel>优惠券组</InputLabel>
              <Button variant="outlined" onClick={handleGroupAppend}>
                添加
              </Button>
            </div>

            {groupField.fields.map((pField, index) => {
              const innerProps = {
                sx: { width: 135 },
                variant: "standard",
                autoComplete: "off",
                size: "small",
              } as const;

              return (
                <div key={pField.id} className="flex items-center mb-5">
                  <div className="flex-auto px-3 py-2 border rounded-lg flex flex-wrap gap-2">
                    <Controller
                      name={`group.${index}.name`}
                      control={control}
                      render={({ field }) => R.renderName(innerProps, field)}
                    />

                    <Controller
                      name={`group.${index}.type`}
                      control={control}
                      render={({ field }) =>
                        R.renderType({ ...innerProps, disabled: true }, field)
                      }
                    />
                    <Controller
                      name={`group.${index}.times`}
                      control={control}
                      render={({ field }) =>
                        R.renderTimes(innerProps, field, false)
                      }
                    />
                    {/* <Controller
                      name={`group.${index}.order`}
                      control={control}
                      render={({ field }) => R.renderOrder(innerProps, field)}
                    /> */}
                    <Controller
                      name={`group.${index}.target`}
                      control={control}
                      render={({ field }) => R.renderTarget(innerProps, field)}
                    />
                    <Controller
                      name={`group.${index}.reduce`}
                      control={control}
                      render={({ field }) => R.renderReduce(innerProps, field)}
                    />
                    <Controller
                      name={`group.${index}.repeat`}
                      control={control}
                      render={({ field }) => R.renderRepeat({}, field)}
                    />
                  </div>

                  <div className="flex-none ml-1">
                    <IconButton onClick={() => groupField.remove(index)}>
                      <RemoveCircleRounded />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          取消
        </Button>
        <Button variant="contained" onClick={handleOk}>
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
});
