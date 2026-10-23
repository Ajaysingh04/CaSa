const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/casa-ecommerce';
  console.log('Connecting to MongoDB Atlas at:', uri);
  await mongoose.connect(uri);

  console.log('--- 1. Ensuring Vendors & Stores ---');
  // Vendor 1: Aarav Luxury Handlooms & Apparel
  const vendor1 = await User.findOneAndUpdate(
    { email: 'vendor@casa.in' },
    {
      name: 'Aarav Sharma (Aarav Fashion)',
      vendorStoreName: 'Aarav Luxury Handlooms & Apparel',
      phone: '+91 98765 24680',
      role: 'vendor',
      vendorApprovalStatus: 'approved',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      vendorDetails: {
        storeDescription: 'Premier manufacturer & curator of authentic Kanjivaram silk, Banarasi weaves, and royal handcrafted Indian ethnic wear.',
        rating: 4.8,
        reviewsCount: 46,
        feedbacks: [
          {
            userName: 'Pooja Kulkarni',
            rating: 5,
            comment: 'The pure Kanjivaram saree arrived in pristine luxury gift packaging. Authentic silk and gold zari work!',
            date: '2026-10-18'
          },
          {
            userName: 'Neha Singhania',
            rating: 5,
            comment: 'Fast dispatch, prompt customer support, and the Anarkali set fit exactly as per standard sizing chart.',
            date: '2026-10-14'
          },
          {
            userName: 'Rohan Mehra',
            rating: 4,
            comment: 'Manyavar kurta set quality is great. Elegant texture and rich festive color.',
            date: '2026-10-09'
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  // Vendor 2: ElectroHub India
  const vendor2 = await User.findOneAndUpdate(
    { email: 'vendor.a@casa.in' },
    {
      name: 'Karan Malhotra (ElectroHub)',
      vendorStoreName: 'ElectroHub Official Store',
      phone: '+91 98112 34567',
      role: 'vendor',
      vendorApprovalStatus: 'approved',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      vendorDetails: {
        storeDescription: 'Authorized retailer for high-end consumer electronics, Apple laptops, Sony ANC audio, and flagship mobile devices.',
        rating: 4.9,
        reviewsCount: 82,
        feedbacks: [
          {
            userName: 'Amitabh Sen',
            rating: 5,
            comment: 'Original MacBook Air M3 with full 1-year Apple India warranty registered right upon activation. 10/10!',
            date: '2026-10-20'
          },
          {
            userName: 'Vikram Grover',
            rating: 5,
            comment: 'Sony WH-1000XM5 active noise cancellation is sensational. Lightning fast dispatch by ElectroHub.',
            date: '2026-10-17'
          },
          {
            userName: 'Deepak Varma',
            rating: 4,
            comment: 'Samsung S24 Ultra was securely bubble-wrapped with tamper-proof security seals intact.',
            date: '2026-10-11'
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  // Vendor 3: StyleStudio Lifestyle
  const vendor3 = await User.findOneAndUpdate(
    { email: 'vendor.b@casa.in' },
    {
      name: 'Simran Bajaj (StyleStudio)',
      vendorStoreName: 'StyleStudio Lifestyle & Accessories',
      phone: '+91 97234 56789',
      role: 'vendor',
      vendorApprovalStatus: 'approved',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      vendorDetails: {
        storeDescription: 'Curated premium footwear, luggage, handcrafted leather goods, and fine silver jewelry.',
        rating: 4.7,
        reviewsCount: 39,
        feedbacks: [
          {
            userName: 'Ananya Roy',
            rating: 5,
            comment: 'GIVA silver necklace is hallmarked pure 925 and looks stunning. Certificate of authenticity included.',
            date: '2026-10-19'
          },
          {
            userName: 'Sameer Sheikh',
            rating: 4,
            comment: 'Nike Air Jordans are 100% genuine. Comfortable sole and box arrived in perfect condition.',
            date: '2026-10-12'
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  console.log('--- 2. Creating Vendor Documents in Vendor Collection ---');
  await Vendor.deleteMany();
  await Vendor.create([
    {
      user: vendor1._id,
      storeName: 'Aarav Luxury Handlooms & Apparel',
      businessEmail: 'aarav.orders@handlooms.in',
      businessPhone: '+91 98765 24680',
      gstin: '07AAACA1234F1Z5',
      pan: 'AAACA1234F',
      pickupAddress: {
        street: '42 Heritage Handloom Street, Silk Market',
        locality: 'Varanasi Central',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221001'
      },
      bankDetails: {
        accountHolderName: 'Aarav Luxury Handlooms Private Limited',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        upiId: 'aaravhandlooms@hdfcbank'
      },
      commissionRate: 10.0,
      isVerified: true,
      status: 'approved',
      metrics: {
        totalOrders: 146,
        grossSales: 485000,
        totalCommissionPaid: 48500,
        settledAmount: 410000,
        pendingSettlement: 26500
      }
    },
    {
      user: vendor2._id,
      storeName: 'ElectroHub Official Store',
      businessEmail: 'support@electrohub.in',
      businessPhone: '+91 98112 34567',
      gstin: '06AACCE9876K1Z9',
      pan: 'AACCE9876K',
      pickupAddress: {
        street: 'Plot 18, Electronic City Phase 1',
        locality: 'Udyog Vihar',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122016'
      },
      bankDetails: {
        accountHolderName: 'ElectroHub India Solutions LLP',
        accountNumber: '91802005678912',
        ifscCode: 'ICIC0000180',
        bankName: 'ICICI Bank',
        upiId: 'electrohub@icici'
      },
      commissionRate: 8.0,
      isVerified: true,
      status: 'approved',
      metrics: {
        totalOrders: 210,
        grossSales: 1845000,
        totalCommissionPaid: 147600,
        settledAmount: 1620000,
        pendingSettlement: 77400
      }
    },
    {
      user: vendor3._id,
      storeName: 'StyleStudio Lifestyle & Accessories',
      businessEmail: 'orders@stylestudio.in',
      businessPhone: '+91 97234 56789',
      gstin: '27AABCJ4567L1Z2',
      pan: 'AABCJ4567L',
      pickupAddress: {
        street: 'Fashion Street, Linking Road 4th Floor',
        locality: 'Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050'
      },
      bankDetails: {
        accountHolderName: 'StyleStudio Retail LLP',
        accountNumber: '334455667788',
        ifscCode: 'SBIN0000300',
        bankName: 'State Bank of India',
        upiId: 'stylestudio@sbi'
      },
      commissionRate: 12.0,
      isVerified: true,
      status: 'approved',
      metrics: {
        totalOrders: 98,
        grossSales: 320000,
        totalCommissionPaid: 38400,
        settledAmount: 265000,
        pendingSettlement: 16600
      }
    }
  ]);

  console.log('--- 3. Linking Catalog Products to Vendors ---');
  // Link Women's & Men's ethnic wear to Vendor 1
  const v1Products = await Product.updateMany(
    { categorySlug: { $in: ['womens-fashion', 'mens-fashion'] } },
    { vendor: vendor1._id }
  );
  console.log('Linked to Vendor 1 (Aarav):', v1Products.modifiedCount);

  // Link Electronics to Vendor 2
  const v2Products = await Product.updateMany(
    { categorySlug: 'electronics' },
    { vendor: vendor2._id }
  );
  console.log('Linked to Vendor 2 (ElectroHub):', v2Products.modifiedCount);

  // Link Footwear, Bags, Watches & Jewellery to Vendor 3
  const v3Products = await Product.updateMany(
    { categorySlug: { $in: ['footwear', 'bags-and-luggage', 'watches-and-jewellery'] } },
    { vendor: vendor3._id }
  );
  console.log('Linked to Vendor 3 (StyleStudio):', v3Products.modifiedCount);

  console.log('--- 4. Enriching Delivery Fleet Riders ---');
  // Rider 1: Vikram Singh
  const rider1 = await User.findOneAndUpdate(
    { email: 'delivery@casa.in' },
    {
      name: 'Vikram Singh (Express Rider)',
      phone: '+91 98765 13579',
      role: 'delivery',
      vehicleType: 'Electric Bike (Hero Optima CX)',
      assignedZone: 'Central Hub - Zone 1 (South & Central Delhi)',
      onDuty: true,
      deliveryApprovalStatus: 'approved',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      deliveryDetails: {
        rating: 4.9,
        totalDeliveries: 154,
        onTimeRate: '98.5%',
        successRate: '99.2%',
        licenseNumber: 'DL-04-2022-0089124',
        feedbacks: [
          {
            customerName: 'Priya Verma',
            rating: 5,
            comment: 'Vikram delivered right on time, verified OTP with warm manners and handled the fragile box carefully.',
            date: '2026-10-21'
          },
          {
            customerName: 'Manish Rawat',
            rating: 5,
            comment: 'Super fast delivery within 45 minutes of dispatch. Professional attitude!',
            date: '2026-10-18'
          },
          {
            customerName: 'Sunita Jain',
            rating: 5,
            comment: 'Polite delivery executive, called in advance before arrival.',
            date: '2026-10-12'
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  // Rider 2: Ramesh Express Courier
  const rider2 = await User.findOneAndUpdate(
    { email: 'rider.ramesh@casa.in' },
    {
      name: 'Ramesh Express Courier (Rider)',
      phone: '+91 98765 43210',
      role: 'delivery',
      vehicleType: 'TVS Raider 125cc (DL-08-BQ-4512)',
      assignedZone: 'East Hub - Zone 2 (Noida / Greater Noida)',
      onDuty: true,
      deliveryApprovalStatus: 'approved',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      deliveryDetails: {
        rating: 4.8,
        totalDeliveries: 112,
        onTimeRate: '97.2%',
        successRate: '98.6%',
        licenseNumber: 'UP-16-2021-0045231',
        feedbacks: [
          {
            customerName: 'Gaurav Mathur',
            rating: 5,
            comment: 'Delivered in heavy rain without soaking the parcel. Excellent work Ramesh!',
            date: '2026-10-19'
          },
          {
            customerName: 'Ritika Roy',
            rating: 4,
            comment: 'Package delivered safely in afternoon slot as requested.',
            date: '2026-10-15'
          }
        ]
      }
    },
    { upsert: true, new: true }
  );

  console.log('✅ Seed and linkage completed successfully!');
  console.log(`Vendors linked: 3 (${vendor1.name}, ${vendor2.name}, ${vendor3.name})`);
  console.log(`Riders linked: 2 (${rider1.name}, ${rider2.name})`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
