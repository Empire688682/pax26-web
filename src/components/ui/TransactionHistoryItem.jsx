import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Cards";
import { Hash, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./badge";

export default function TransactionHistoryItem({ data }) {
  const isSuccess = data?.status === "success";
  const isPending = data?.status === "pending";
  const statusColor = isSuccess
    ? "bg-emerald-500"
    : isPending
    ? "bg-amber-500"
    : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="w-full shadow-md rounded-2xl p-5 border border-gray-100 dark:border-gray-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg capitalize font-bold flex items-center gap-2">
            {data?.type || "Transaction"}
          </CardTitle>
          <Badge className={`${statusColor} text-white px-3 py-1 rounded-full capitalize text-xs font-semibold`}>
            {data?.status || "completed"}
          </Badge>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Amount</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ₦{data?.amount?.toLocaleString() || 0}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Description</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {data?.description || data?.type || "Wallet Transaction"}
            </span>
          </div>

          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Transaction ID / Ref</span>
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
              <Hash className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate">{data?.reference || data?.transactionId || data?._id || "N/A"}</span>
            </span>
          </div>

          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Date & Time</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {data?.createdAt ? new Date(data.createdAt).toLocaleString() : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
