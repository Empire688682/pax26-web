import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Phone, CheckCircle, XCircle, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./badge";

export default function TransactionHistoryItem({ data }) {
    const statusColor = data.status === "success" ? "bg-green-500" : "bg-red-500";
    console.log("TransactionHistoryItem data:", data);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
        >
            <Card className="w-full shadow-lg rounded-2xl p-4 border border-gray-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl capitalize font-semibold flex items-center gap-2">
                        {data?.type}
                    </CardTitle>
                    <Badge className={`${statusColor} text-white px-3 py-1 rounded-full capitalize`}>
                        {data.status}
                    </Badge>
                </CardHeader>

                <CardContent className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Amount</span>
                        <span className="text-lg font-medium">₦{data.amount}</span>
                    </div>

                    {
                        data?.type !== "Wallet funding" && data?.type !== "electricity" && (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm"> {data.type }Phone Number</span>
                                <span className="text-lg font-medium">{data?.metadata?.number}</span>
                            </div>
                        )
                    }

                    {
                        data?.type !== "Wallet funding" && data?.type !== "electricity" && (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Network</span>
                                <span className="text-lg font-medium">{data?.metadata?.network}</span>
                            </div>
                        )
                    }
                    
                    {
                        data?.type === "electricity"&& (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Provider</span>
                                <span className="text-lg font-medium">{data?.metadata?.network}</span>
                            </div>
                        )
                    }
                    {
                        data?.type === "electricity"&& (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Meter number</span>
                                <span className="text-lg font-medium">{data?.metadata?.network}</span>
                            </div>
                        )
                    }
                    {
                        data?.type === "electricity"&& (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Meter name</span>
                                <span className="text-lg font-medium">{data?.metadata?.name || "Mock name"}</span>
                            </div>
                        )
                    }
                    {
                        data?.type === "electricity"&& (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Meter address</span>
                                <span className="text-lg font-medium">{data?.metadata?.address || "Home mock data No. 10"}</span>
                            </div>
                        )
                    }
                    {
                        data?.type === "electricity"&& (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Token</span>
                                <span className="text-lg font-medium">{data?.token || "f0ce9d35-0163-418a-91eb-6098ad8de3aa"}</span>
                            </div>
                        )
                    }


                    {
                        data?.type === "Wallet Funding" && (
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm">Funding Method</span>
                            </div>)
                    }

                    <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Transaction ID</span>
                        <span className="text-lg font-medium flex items-center gap-1">
                            <Hash className="w-4 h-4" /> {data.transactionId}
                        </span>
                    </div>

                    <div className="flex flex-col col-span-2">
                        <span className="text-gray-500 text-sm">Reference</span>
                        <span className="text-lg font-medium">{data.reference}</span>
                    </div>

                    <div className="flex flex-col col-span-2">
                        <span className="text-gray-500 text-sm">Date</span>
                        <span className="text-lg font-medium">{new Date(data.createdAt).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
