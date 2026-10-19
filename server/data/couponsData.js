const couponsData = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountAmount: 10,
    minOrderAmount: 999,
    maxDiscountAmount: 500,
    isActive: true,
    description: "10% off up to ₹500 on your first CASA order above ₹999",
    usageLimit: 10000,
    usedCount: 142
  },
  {
    code: "FESTIVE15",
    discountType: "percentage",
    discountAmount: 15,
    minOrderAmount: 2499,
    maxDiscountAmount: 1200,
    isActive: true,
    description: "15% off up to ₹1,200 on festive orders above ₹2,499",
    usageLimit: 5000,
    usedCount: 280
  },
  {
    code: "CASA200",
    discountType: "fixed",
    discountAmount: 200,
    minOrderAmount: 1499,
    maxDiscountAmount: 200,
    isActive: true,
    description: "Flat ₹200 instant discount on orders above ₹1,499",
    usageLimit: 20000,
    usedCount: 890
  }
];

module.exports = couponsData;
