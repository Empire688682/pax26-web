import { useGlobalContext } from "@/components/Context";

export function usePlanLimits() {
  const { userData } = useGlobalContext();

  const plan = userData?.paxAI?.plan || "free";
  
  // Extract values from userData.paxAI
  const broadcastLimit = userData?.paxAI?.broadcastContactsLimit ?? 0;
  const broadcastUsed = userData?.paxAI?.broadcastContactsUsedThisMonth ?? 0;
  
  // Free plan has broadcast limit 0, so broadcast is not allowed
  const canBroadcast = plan !== "free";
  
  // Enterprise plan has unlimited broadcasts (null or Infinity)
  const broadcastRemaining = plan === "enterprise" 
    ? Infinity 
    : Math.max(0, broadcastLimit - broadcastUsed);
  
  const canSchedule = !!userData?.paxAI?.scheduledBroadcast;
  const canSegment = !!userData?.paxAI?.segmentation;
  const canBulkSequence = !!userData?.paxAI?.bulkSequences;
  const removeBranding = !!userData?.paxAI?.removeBranding;

  return {
    plan,
    canBroadcast,
    broadcastLimit,
    broadcastUsed,
    broadcastRemaining,
    canSchedule,
    canSegment,
    canBulkSequence,
    removeBranding
  };
}
