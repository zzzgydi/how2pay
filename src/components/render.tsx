import {
  FormControl,
  FormControlLabel,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { ControllerRenderProps, UseFormRegisterReturn } from "react-hook-form";

type AnyField = ControllerRenderProps<any, any> | UseFormRegisterReturn;

export function renderName(textProps: any, field: AnyField) {
  return <TextField {...field} {...textProps} required label="优惠券名称" />;
}

export function renderType(controlProps: FormControlProps, field: AnyField) {
  return (
    <FormControl {...controlProps} required>
      <InputLabel>优惠券类型</InputLabel>
      <Select {...field}>
        <MenuItem value="target">满减</MenuItem>
        <MenuItem value="sale">打折</MenuItem>
        <MenuItem value="group">分组</MenuItem>
      </Select>
    </FormControl>
  );
}

export function renderTarget(textProps: any, field: AnyField) {
  return (
    <TextField
      {...field}
      {...textProps}
      required
      type="number"
      label="满减目标金额"
    />
  );
}

export function renderReduce(textProps: any, field: AnyField) {
  return (
    <TextField
      {...field}
      {...textProps}
      required
      type="number"
      label="满减优惠金额"
    />
  );
}

export function renderSale(textProps: any, field: AnyField) {
  return (
    <TextField
      {...field}
      {...textProps}
      required
      type="number"
      label="打折折扣"
      helperText="例如，95折就填0.95"
    />
  );
}
export function renderSaleTarget(textProps: any, field: AnyField) {
  return (
    <TextField
      {...field}
      {...textProps}
      type="number"
      label="目标金额"
      helperText="可能存在达到额度才享受折扣，如无可以不填"
    />
  );
}

export function renderOrder(controlProps: FormControlProps, field: AnyField) {
  return (
    <FormControl {...controlProps} required>
      <InputLabel>扣费顺序</InputLabel>
      <Select {...field}>
        <MenuItem value={1}>按总价计算</MenuItem>
        <MenuItem value={3}>按到手价计算</MenuItem>
      </Select>
    </FormControl>
  );
}

export function renderTimes(textProps: any, field: AnyField, withHelp = true) {
  return (
    <TextField
      {...field}
      {...textProps}
      required
      label="可用次数"
      type="number"
      helperText={
        withHelp
          ? "例如，满300减50可以多次使用，这里就填足够大的数，比如99999"
          : undefined
      }
    />
  );
}

export function renderRepeat(textProps: any, field: AnyField) {
  return (
    <FormControlLabel
      {...textProps}
      {...field}
      sx={{ ml: 0 }}
      control={<Switch />}
      labelPlacement="start"
      label={<InputLabel>可重复使用</InputLabel>}
    />
  );
}
