import { Response } from 'express';
import { User } from '../models/User.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { BuyerProfile } from '../models/BuyerProfile.ts';
import { Notification } from '../models/Notification.ts';
import { AuthenticatedRequest, generateToken } from '../middleware/auth.ts';

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    // Strict validation
    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, password, confirm password, role) are required.',
      });
    }

    if (role !== 'farmer' && role !== 'buyer') {
      return res.status(400).json({
        success: false,
        message: 'Public registration allows only Farmer or Buyer roles. Admin accounts cannot be created here.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    // Check unique email and phone
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number is already registered.',
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role,
      isActive: true,
    });
    await user.save();

    // Create corresponding profile
    let profile: any = null;
    if (role === 'farmer') {
      profile = await FarmerProfile.create({
        userId: user._id,
        farmName: `${user.name}'s Farm`,
        location: {
          state: req.body.state || '',
          district: req.body.district || '',
          village: req.body.village || '',
          pincode: req.body.pincode || '',
        },
        experienceYears: req.body.experienceYears || 0,
        farmSizeAcres: req.body.farmSizeAcres || 0,
        soilType: req.body.soilType || 'Alluvial Soil',
        irrigationSource: req.body.irrigationSource || 'Drip Irrigation',
        productionCapacityTons: req.body.productionCapacityTons || 0,
        primaryCrops: req.body.primaryCrops || [],
        bio: req.body.bio || '',
      });
    } else if (role === 'buyer') {
      profile = await BuyerProfile.create({
        userId: user._id,
        companyName: req.body.companyName || `${user.name} Trading Co.`,
        businessType: req.body.businessType || 'Agri Processing & Milling',
        registrationNumber: req.body.registrationNumber || '',
        gstNumber: req.body.gstNumber || '',
        address: {
          state: req.body.state || '',
          city: req.body.city || '',
          street: req.body.street || '',
          pincode: req.body.pincode || '',
        },
        contactPerson: {
          name: user.name,
          designation: req.body.designation || 'Procurement Manager',
          phone: user.phone,
          email: user.email,
        },
        verificationStatus: 'not_submitted',
        documentStatus: 'not_uploaded',
      });
    }

    // Create initial welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to AGRIYA!',
      message:
        role === 'farmer'
          ? 'Your farmer account is active. Complete your farm profile and explore published contracts.'
          : 'Your buyer account is created. Complete your business details and upload verification documents to publish contracts.',
      type: 'system',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.',
    });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number and password are required.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query user with password selected
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: identifier.trim() }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User does not exist.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Fetch user profile
    let profile: any = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'buyer') {
      profile = await BuyerProfile.findOne({ userId: user._id });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.',
    });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user!;
    let profile: any = null;

    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id });
    } else if (user.role === 'buyer') {
      profile = await BuyerProfile.findOne({ userId: user._id });
    }

    const unreadNotificationsCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      profile,
      unreadNotificationsCount,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve user profile.',
    });
  }
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully. Client credentials must be cleared.',
  });
}
