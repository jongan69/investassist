"use client"
import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/users/getLeaderboard";
import { columns } from "@/components/wallet-leaderboard/columns";
import DataTable from "@/components/wallet-leaderboard/data-table";

export default function Leaderboard() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getLeaderboard();
            const sortedData = result.leaderboard.sort((a: any, b: any) => b.totalValue - a.totalValue);
            // Update each user to have totalValue as a string with 2 decimal places
            const updatedData = sortedData.map((user: any) => ({
                ...user,
                totalValue: Number(user.totalValue.toFixed(2)),
            }));
            // console.log(updatedData)
            setData(updatedData);
           
        };

        fetchData();
    }, []);

    if (!data) return null;

    return (
        <div className="container p-2">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Portfolio Leaderboard</h2>
            {data && <DataTable data={data} columns={columns} />}
        </div >
    )
}       