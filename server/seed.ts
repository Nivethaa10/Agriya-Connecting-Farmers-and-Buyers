import { User } from './models/User.ts';
import { BuyerProfile } from './models/BuyerProfile.ts';
import { FarmerProfile } from './models/FarmerProfile.ts';
import { Contract } from './models/Contract.ts';

export async function seedInitialData() {
  try {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@agriya.org';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecure@2026';
    const adminName = process.env.INITIAL_ADMIN_NAME || 'Agriya System Admin';
    const adminPhone = process.env.INITIAL_ADMIN_PHONE || '+919876543210';

    // 1. Ensure Initial Admin is provisioned securely
    const existingAdmin = await User.findOne({ email: adminEmail });
    let adminUser = existingAdmin;
    if (!existingAdmin) {
      console.log(`Provisioning secure Initial Admin account (${adminEmail})...`);
      adminUser = new User({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      await adminUser.save();
      console.log('Initial Admin provisioned successfully.');
    }

    // 2. Provision an initial verified demo buyer to publish initial sample contracts if no contracts exist
    const sampleBuyerEmail = 'procurement@agriexport.in';
    let sampleBuyer = await User.findOne({ email: sampleBuyerEmail });
    if (!sampleBuyer) {
      console.log('Provisioning verified institutional buyer organization for sample contracts...');
      sampleBuyer = new User({
        name: 'Vikramaditya Sengupta',
        email: sampleBuyerEmail,
        phone: '+919811223344',
        password: 'BuyerSecure@2026',
        role: 'buyer',
        isActive: true,
      });
      await sampleBuyer.save();

      await BuyerProfile.create({
        userId: sampleBuyer._id,
        companyName: 'Bhartiya Agro-Exports Corporation',
        businessType: 'Wholesaler / Exporter',
        registrationNumber: 'CIN-U01100DL2018PTC334812',
        gstNumber: '07AAACB2194L1Z9',
        panNumber: 'AAACB2194L',
        address: {
          state: 'Delhi',
          city: 'New Delhi',
          street: 'Barakhamba Road, Connaught Place',
          pincode: '110001',
        },
        contactPerson: {
          name: 'Vikramaditya Sengupta',
          designation: 'Head of Contract Procurement',
          phone: '+919811223344',
          email: sampleBuyerEmail,
        },
        procurementInterests: ['Basmati Rice', 'Durum Wheat', 'Organic Soybean', 'Mustard Seed'],
        annualProcurementBudget: 50000000,
        verificationStatus: 'verified', // Admin pre-verified
        documentStatus: 'uploaded',
        verificationNotes: 'Institutional exporter credentials verified via MCA & DGFT export license audit.',
        verifiedAt: new Date(),
        verifiedBy: adminUser?._id,
      });
    }

    // 3. Check if contracts exist. If none, seed realistic published sample contracts
    const contractsCount = await Contract.countDocuments();
    if (contractsCount === 0 && sampleBuyer) {
      console.log('Seeding initial sample contract farming opportunities (labeled isSample: true)...');

      const sampleContracts = [
        {
          buyerId: sampleBuyer._id,
          title: 'Premium Traditional Basmati Rice (Pusa 1121) Export Grade',
          cropName: 'Basmati Rice',
          cropVariety: 'Pusa 1121 Extended Grain',
          category: 'Cereals & Grains',
          quantityRequiredTons: 50,
          minQuantityPerFarmerTons: 5,
          allocatedQuantityTons: 0,
          pricePerTon: 46500, // ₹46,500 / ton (₹4,650 / quintal)
          qualityStandards: {
            grade: 'Grade A - Export Quality (Min 8.2mm grain length)',
            maxMoisturePercent: 12.0,
            maxForeignMatterPercent: 1.0,
            specificationNotes: 'Aroma score > 8.0, zero chalky kernels, maximum broken grains 2.5%. Non-GMO certification required.',
          },
          cultivationStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          expectedHarvestDate: new Date(Date.now() + 115 * 24 * 60 * 60 * 1000),
          deliveryDeadline: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000),
          deliveryLocation: {
            facilityName: 'Karnal Modern Agri Logistics & Export Hub',
            state: 'Haryana',
            district: 'Karnal',
            address: 'NH-44 Sector 33, Grain Terminal Complex',
          },
          paymentTerms: {
            advancePercentage: 20,
            onDeliveryPercentage: 80,
            settlementDays: 5,
            notes: '20% advance transfer upon sowing verification; 80% direct RTGS within 5 banking days of digital weighment and moisture report.',
          },
          status: 'published',
          isSample: true,
          publishedAt: new Date(),
        },
        {
          buyerId: sampleBuyer._id,
          title: 'Certified High-Protein Non-GMO Yellow Soybeans',
          cropName: 'Soybean',
          cropVariety: 'JS-335 Certified High Yield',
          category: 'Oilseeds',
          quantityRequiredTons: 40,
          minQuantityPerFarmerTons: 4,
          allocatedQuantityTons: 0,
          pricePerTon: 52000, // ₹52,000 / ton
          qualityStandards: {
            grade: 'Grade 1 Processing Standard (Min 40% crude protein)',
            maxMoisturePercent: 10.5,
            maxForeignMatterPercent: 1.2,
            specificationNotes: 'Oil content > 18.5%, zero aflatoxin contamination, cleaned and graded.',
          },
          cultivationStartDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          expectedHarvestDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000),
          deliveryDeadline: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000),
          deliveryLocation: {
            facilityName: 'Indore Edible Oils Processing Plant',
            state: 'Madhya Pradesh',
            district: 'Indore',
            address: 'Pithampur Industrial Area Sector 2, Dhar Road',
          },
          paymentTerms: {
            advancePercentage: 15,
            onDeliveryPercentage: 85,
            settlementDays: 7,
            notes: 'Direct RTGS to farmer bank account with GST-exempt invoice.',
          },
          status: 'published',
          isSample: true,
          publishedAt: new Date(),
        },
        {
          buyerId: sampleBuyer._id,
          title: 'Firm Processing Roma Tomatoes for Organic Puree',
          cropName: 'Roma Tomato',
          cropVariety: 'Determinate Plum Hybrid',
          category: 'Vegetables',
          quantityRequiredTons: 25,
          minQuantityPerFarmerTons: 2.5,
          allocatedQuantityTons: 0,
          pricePerTon: 24000, // ₹24,000 / ton (₹24 / kg)
          qualityStandards: {
            grade: 'Grade A Processing Firm Red (Brix 5.2+)',
            maxMoisturePercent: 92,
            maxForeignMatterPercent: 0.5,
            specificationNotes: 'Uniform deep red coloration, thick walls, no sunburn or pest stings. Harvested at firm ripe stage.',
          },
          cultivationStartDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          expectedHarvestDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
          deliveryDeadline: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
          deliveryLocation: {
            facilityName: 'Nashik Agro-Food Park Cold Chain',
            state: 'Maharashtra',
            district: 'Nashik',
            address: 'MIDC Ambad Processing Zone',
          },
          paymentTerms: {
            advancePercentage: 25,
            onDeliveryPercentage: 75,
            settlementDays: 3,
            notes: '25% advance for drip fertigation inputs; 75% payment within 72 hours of cold intake.',
          },
          status: 'published',
          isSample: true,
          publishedAt: new Date(),
        },
        {
          buyerId: sampleBuyer._id,
          title: 'Export Quality Guntur Sannam Red Chillies (Stemless)',
          cropName: 'Red Chilli',
          cropVariety: 'S17 Guntur Teja / Sannam',
          category: 'Spices',
          quantityRequiredTons: 15,
          minQuantityPerFarmerTons: 1.5,
          allocatedQuantityTons: 0,
          pricePerTon: 185000, // ₹1,85,000 / ton (₹185 / kg)
          qualityStandards: {
            grade: 'Export Grade (SHU 35,000 - 45,000)',
            maxMoisturePercent: 10.0,
            maxForeignMatterPercent: 1.0,
            specificationNotes: 'Natural bright red color value (ASTA 70+), free from pesticide residues compliant with EU MRL standards.',
          },
          cultivationStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          expectedHarvestDate: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000),
          deliveryDeadline: new Date(Date.now() + 145 * 24 * 60 * 60 * 1000),
          deliveryLocation: {
            facilityName: 'Guntur Spices Export Terminal',
            state: 'Andhra Pradesh',
            district: 'Guntur',
            address: 'Market Yard Road, Spices Board Zone',
          },
          paymentTerms: {
            advancePercentage: 20,
            onDeliveryPercentage: 80,
            settlementDays: 7,
            notes: 'Certified lab test report provided upon intake. Immediate release to farmer bank account.',
          },
          status: 'published',
          isSample: true,
          publishedAt: new Date(),
        },
        {
          buyerId: sampleBuyer._id,
          title: 'Premium Sharbati Durum Wheat for High-End Bakery & Pasta',
          cropName: 'Durum Wheat',
          cropVariety: 'HI 8627 Sharbati Golden',
          category: 'Cereals & Grains',
          quantityRequiredTons: 60,
          minQuantityPerFarmerTons: 5,
          allocatedQuantityTons: 0,
          pricePerTon: 38000, // ₹38,000 / ton
          qualityStandards: {
            grade: 'Millers Choice Grade A (Min 13.5% Protein, Gluten > 28%)',
            maxMoisturePercent: 11.0,
            maxForeignMatterPercent: 1.0,
            specificationNotes: 'Bold amber vitreous grains, hectolitre weight > 79 kg/hl, zero weevilled grains.',
          },
          cultivationStartDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          expectedHarvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          deliveryDeadline: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000),
          deliveryLocation: {
            facilityName: 'Sehore Mega Agro Terminal',
            state: 'Madhya Pradesh',
            district: 'Sehore',
            address: 'Bhopal-Indore Highway Agripark',
          },
          paymentTerms: {
            advancePercentage: 15,
            onDeliveryPercentage: 85,
            settlementDays: 5,
            notes: '15% input assistance advance, remaining within 5 working days of grain weighment.',
          },
          status: 'published',
          isSample: true,
          publishedAt: new Date(),
        },
      ];

      await Contract.insertMany(sampleContracts);
      console.log(`Seeded ${sampleContracts.length} realistic sample contracts.`);
    }
  } catch (err) {
    console.error('Error during data seeding:', err);
  }
}
