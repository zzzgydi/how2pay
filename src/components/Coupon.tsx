import { useState } from "react";
import { EditRounded, HighlightOff } from "@mui/icons-material";

interface Props {
  coupon: ICoupon;
  editable: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const Coupon = (props: Props) => {
  const { coupon, editable, onEdit, onDelete } = props;

  return (
    <div className="text-sm inline-flex items-center rounded-lg px-3 py-1 bg-orange-200">
      <span className="mr-1">{coupon.name}</span>

      {editable && (
        <EditRounded
          fontSize="small"
          className="cursor-pointer"
          onClick={onEdit}
        />
      )}
      {editable && (
        <HighlightOff
          fontSize="small"
          className="cursor-pointer"
          onClick={onDelete}
        />
      )}
    </div>
  );
};
