"use client"
import Link from "next/link"

export default function Leaderboard(data: any) {
    const leaderboard = data.data.leaderboard
    console.log(leaderboard)
    return (
        leaderboard && <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Leaderboard</h2>
            <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Rank</th>
                            <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Username</th>
                            <th className="px-6 py-3 border-b dark:border-gray-600 text-left text-gray-700 dark:text-gray-300">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard?.map((user: any, index: number) => (
                            <tr
                                key={`${user.id}-${index}`}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => window.location.href = `/users/${user.username}`}
                            >
                                <td className="px-6 py-4 border-b dark:border-gray-600 dark:text-gray-300">
                                    <Link
                                        key={`${user.id}-rank-${index}`}
                                        href={`/users/${user.username}`}
                                        className="block w-full h-full"
                                    >
                                        {index + 1}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 border-b dark:border-gray-600 dark:text-gray-300">
                                    <Link
                                        key={`${user.id}-username-${index}`}
                                        href={`/users/${user.username}`}
                                        className="block w-full h-full"
                                    >
                                        {user.username}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 border-b dark:border-gray-600 dark:text-gray-300">
                                    <Link
                                        key={`${user.id}-value`}
                                        href={`/users/${user.username}`}
                                        className="block w-full h-full"
                                    >
                                        ${user.totalValue.toFixed(2)}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}       