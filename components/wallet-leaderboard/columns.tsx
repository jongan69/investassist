"use client";

import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";

import { DataTableColumnHeader } from "@/components/wallet-leaderboard/data-table-column-header";
import { DataTableRowActions } from "@/components/wallet-leaderboard/data-table-row-actions";
import { Wallet } from "@/types/wallet";
import { usersStatus } from "./definitions";
import Image from "next/image";
export const columns: ColumnDef<Wallet>[] = [
  {
    accessorKey: "username",
    header: () => <h1> User </h1>,
    cell: ({ row }) => {
      return <>
        <h1>{row.getValue("username")}</h1>
        <Image
          src={`https://avatar.iran.liara.run/username?username=${row.getValue("username")}`}
          alt="Profile Pic" width={32} height={32}
          priority={false}
          placeholder="blur"
          blurDataURL={`https://placehold.co/32x32`}
        />
      </>;
    },
  },
  {
    accessorKey: "walletAddress",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Address"} />,
  },
  {
    accessorKey: "totalValue",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Portfolio Value ($)"} />,
  },
  // {
  //   accessorKey: "pnl",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={"PnL"} />,
  //   filterFn: (row, id, value: string[]) => {
  //     if (!value.length) return true;
  //     const pnl = row.getValue(id) as number;
  //     return value.some((v) => {
  //       if (v === "positive") return pnl >= 0;
  //       if (v === "negative") return pnl < 0;
  //       return false;
  //     });
  //   },
  // },
  // {
  //   accessorKey: "rtn",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={"RTN"} />,
  // },
  // {
  //   accessorKey: "otherInformation",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={"Other Info"} />,
  // },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title={"Status"} />,
  //   cell: ({ row }) => {
  //     const status = usersStatus.find((status) => status.value === row.getValue("status"));

  //     if (!status) {
  //       return null;
  //     }

  //     return (
  //       <div
  //         className={clsx("flex w-[100px] items-center", {
  //           "text-red-500": status.value === "inactive",
  //           "text-green-500": status.value === "active",
  //         })}>
  //         {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
  //         <span>{status.label}</span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
