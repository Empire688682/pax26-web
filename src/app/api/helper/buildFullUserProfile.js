import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import UserAutomationModel from "@/app/ults/models/UserAutomationModel";

/**
 * buildFullUserProfile
 * Generates the unified, complete user profile payload returned to mobile & web clients.
 * Includes core info, sanitized whatsapp status, business profile, and AI usage metrics.
 */
export async function buildFullUserProfile(userId) {
  try {
    const [user, userSellerProfile, doc] = await Promise.all([
      UserModel.findById(userId),
      SellerProfileModel.findOne({ userId }).lean(),
      UserAutomationModel.findOne({ userId }).lean(),
    ]);

    if (!user) return null;

    const userMessageList = user.whatsapp?.contacts?.list;
    const messagesHandled = Array.isArray(userMessageList)
      ? userMessageList.reduce((total, contact) => total + (contact?.messageCount || 0), 0)
      : 0;
    const workflows = doc?.automations?.filter(auto => auto.enabled).length ?? 0;

    const userObj = user.toObject();
    userObj.businessProfile = userSellerProfile || {};
    userObj.messagesHandled = messagesHandled;
    userObj.workflows = workflows;
    userObj.contacts = Array.isArray(user.whatsapp?.contacts?.list) ? user.whatsapp.contacts.list.length : 0;
    userObj.whatsappBusinessNo = user.whatsapp?.displayPhone || null;
    userObj.authTimestamp = Date.now();
    userObj.mobileNotifPrefs = userObj.mobileNotifPrefs || {
      newOrder: true,
      salesAlert: true,
      agentReply: true,
      newLead: true,
    };

    // Preserve public WhatsApp connection status & phone info; strip secret tokens
    if (userObj.whatsapp) {
      userObj.whatsapp = {
        connected: !!userObj.whatsapp.connected,
        displayPhone: userObj.whatsapp.displayPhone || "",
        phoneNumberId: userObj.whatsapp.phoneNumberId || "",
        connectedAt: userObj.whatsapp.connectedAt || null,
      };
    } else {
      userObj.whatsapp = {
        connected: false,
        displayPhone: "",
        phoneNumberId: "",
        connectedAt: null,
      };
    }

    // Strip sensitive fields
    delete userObj.password;
    delete userObj.transactionPin;
    delete userObj.isAdmin;
    delete userObj.provider;
    delete userObj.referralHost;
    delete userObj.walletBalance;
    delete userObj.__v;
    delete userObj.commissionBalance;
    delete userObj.referralHostId;
    delete userObj.forgottenPasswordToken;
    delete userObj.bvn;
    delete userObj.emailVerification;
    delete userObj.phoneVerification;

    return userObj;
  } catch (err) {
    console.error("buildFullUserProfile error:", err);
    return null;
  }
}
