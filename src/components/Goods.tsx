import { Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Props {
  goods: IGoods[];
  onChange?: (goods: IGoods[]) => void;
  onEdit?: (item: IGoods) => void;
  onDelete?: (item: IGoods) => void;
}

export const Goods = (props: Props) => {
  const { goods, onChange, onEdit, onDelete } = props;

  const dataRows = goods.map((item, index) => ({
    index: index + 1,
    ...item,
  }));

  const columns: GridColDef[] = [
    {
      field: "index",
      headerName: "序号",
      width: 60,
      disableColumnMenu: true,
    },
    {
      field: "name",
      headerName: "商品名称",
      disableColumnMenu: true,
      width: 180,
    },
    {
      field: "deposit",
      headerName: "定金",
      disableColumnMenu: true,
    },
    {
      field: "shopSale",
      headerName: "店铺优惠",
      disableColumnMenu: true,
    },
    {
      field: "price",
      headerName: "总价",
      disableColumnMenu: true,
    },
    {
      field: "coupons",
      headerName: "优惠券",
      minWidth: 200,
      maxWidth: 300,
      disableColumnMenu: true,
    },
    {
      field: "remark",
      headerName: "备注",
      disableColumnMenu: true,
    },
    {
      field: "operator",
      headerName: "操作",
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => (
        <div>
          <Button size="small" onClick={() => onEdit?.(params.row)}>
            编辑
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete?.(params.row)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataGrid
      getRowId={(row) => row.index}
      hideFooter
      rows={dataRows}
      columns={columns}
      density="compact"
      sx={{
        height: 300,
        "div:focus": { outline: "none !important" },
      }}
    />
  );
};
