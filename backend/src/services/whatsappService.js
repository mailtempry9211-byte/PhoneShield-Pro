/**
 * WhatsApp Service
 * =============================================
 * Generates WhatsApp share links for:
 *   - Invoices
 *   - Repair status updates
 *   - Phone details
 *   - Customer receipts
 * =============================================
 */

/**
 * Generates a WhatsApp share link.
 *
 * @function generateWhatsAppLink
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} message - Message to send
 * @returns {string} WhatsApp URL
 */
const generateWhatsAppLink = (phoneNumber, message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

/**
 * Generate invoice share link.
 *
 * @function shareInvoice
 * @param {string} phoneNumber - Customer phone number
 * @param {Object} invoiceData - Invoice details
 * @returns {string} WhatsApp URL
 */
exports.shareInvoice = (phoneNumber, invoiceData) => {
  const { invoiceNumber, customerName, totalAmount, date } = invoiceData;
  const message = `Dear ${customerName},\n\nYour invoice ${invoiceNumber} has been generated.\n\nDate: ${date}\nTotal Amount: ₹${totalAmount}\n\nThank you for your business!\n\nPhoneShield Pro`;
  return generateWhatsAppLink(phoneNumber, message);
};

/**
 * Generate repair status share link.
 *
 * @function shareRepairStatus
 * @param {string} phoneNumber - Customer phone number
 * @param {Object} repairData - Repair details
 * @returns {string} WhatsApp URL
 */
exports.shareRepairStatus = (phoneNumber, repairData) => {
  const { repairId, customerName, deviceBrand, deviceModel, status, estimatedCost } = repairData;
  const message = `Dear ${customerName},\n\nYour repair job ${repairId} status has been updated.\n\nDevice: ${deviceBrand} ${deviceModel}\nStatus: ${status}\nEstimated Cost: ₹${estimatedCost}\n\nWe will notify you when your device is ready.\n\nPhoneShield Pro`;
  return generateWhatsAppLink(phoneNumber, message);
};

/**
 * Generate phone details share link.
 *
 * @function sharePhoneDetails
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} phoneData - Phone details
 * @returns {string} WhatsApp URL
 */
exports.sharePhoneDetails = (phoneNumber, phoneData) => {
  const { brand, model, imei, storage, color, sellingPrice, condition } = phoneData;
  const message = `Phone Details:\n\nBrand: ${brand}\nModel: ${model}\nIMEI: ${imei}\nStorage: ${storage}\nColor: ${color}\nCondition: ${condition}\nPrice: ₹${sellingPrice}\n\nInterested? Contact us!\n\nPhoneShield Pro`;
  return generateWhatsAppLink(phoneNumber, message);
};

/**
 * Generate customer receipt share link.
 *
 * @function shareCustomerReceipt
 * @param {string} phoneNumber - Customer phone number
 * @param {Object} receiptData - Receipt details
 * @returns {string} WhatsApp URL
 */
exports.shareCustomerReceipt = (phoneNumber, receiptData) => {
  const { receiptNumber, customerName, items, totalAmount, date } = receiptData;
  const itemsList = items.map((item) => `- ${item.description}: ₹${item.price}`).join('\n');
  const message = `Dear ${customerName},\n\nYour receipt ${receiptNumber}:\n\n${itemsList}\n\nTotal: ₹${totalAmount}\nDate: ${date}\n\nThank you for your purchase!\n\nPhoneShield Pro`;
  return generateWhatsAppLink(phoneNumber, message);
};