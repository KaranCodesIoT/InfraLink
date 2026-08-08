import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/modules/users/user.model.js';
import BuilderProfile from '../src/modules/builders/builderProfile.model.js';
import ContractorProfile from '../src/modules/contractors/contractorProfile.model.js';
import WorkerProfile from '../src/modules/workers/workerProfile.model.js';
import SupplierProfile from '../src/modules/suppliers/supplierProfile.model.js';
import { hashPassword } from '../src/utils/encryption.utils.js';

dotenv.config();

export const runSeedProfiles = async () => {
    console.log('🌱 Creating 5 dummy profiles per section...');

    const hashedPwd = await hashPassword('Password123!');

    // Clean existing dummy profiles seeded previously
    const dummyEmails = [
        /builder.*\.dummy@infralink\.com/,
        /architect.*\.dummy@infralink\.com/,
        /contractor.*\.dummy@infralink\.com/,
        /labour.*\.dummy@infralink\.com/,
        /supplier.*\.dummy@infralink\.com/
    ];

    for (const pattern of dummyEmails) {
        const usersToDelete = await User.find({ email: pattern }).select('_id');
        const userIds = usersToDelete.map(u => u._id);
        
        await BuilderProfile.deleteMany({ user: { $in: userIds } });
        await ContractorProfile.deleteMany({ user: { $in: userIds } });
        await WorkerProfile.deleteMany({ user: { $in: userIds } });
        await SupplierProfile.deleteMany({ user: { $in: userIds } });
        await User.deleteMany({ _id: { $in: userIds } });
    }

    // 1. BUILDERS & DEVELOPERS (5 profiles)
    const buildersData = [
        {
            name: 'Apex Infrastructure & Developers',
            email: 'builder1.dummy@infralink.com',
            companyName: 'Apex Infra Projects Pvt Ltd',
            city: 'Delhi NCR',
            exp: 14,
            services: ['Residential Highrises', 'Commercial Parks', 'Turnkey Construction'],
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
            rating: 4.8,
            followers: 142
        },
        {
            name: 'Skyline Urban Developers',
            email: 'builder2.dummy@infralink.com',
            companyName: 'Skyline Buildtech',
            city: 'Mumbai',
            exp: 10,
            services: ['Luxury Apartments', 'Gated Communities', 'Green Building'],
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            rating: 4.6,
            followers: 98
        },
        {
            name: 'Prestige Realty & Construction',
            email: 'builder3.dummy@infralink.com',
            companyName: 'Prestige Infra Projects',
            city: 'Bengaluru',
            exp: 18,
            services: ['Villa Communities', 'IT Parks', 'Structural Engineering'],
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            rating: 4.9,
            followers: 230
        },
        {
            name: 'Vanguard Mega Projects',
            email: 'builder4.dummy@infralink.com',
            companyName: 'Vanguard Builders',
            city: 'Hyderabad',
            exp: 8,
            services: ['Smart Cities', 'Roads & Highways', 'Commercial Complexes'],
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            rating: 4.5,
            followers: 84
        },
        {
            name: 'Zenith Housing & Infrastructure',
            email: 'builder5.dummy@infralink.com',
            companyName: 'Zenith Infra Group',
            city: 'Pune',
            exp: 12,
            services: ['Affordable Housing', 'Township Development', 'Renovations'],
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            rating: 4.7,
            followers: 115
        }
    ];

    for (const b of buildersData) {
        const user = await User.create({
            name: b.name,
            email: b.email,
            password: hashedPwd,
            role: 'builder',
            isVerified: true,
            isActive: true,
            avatar: b.avatar,
            profilePic: b.avatar,
            skills: b.services,
            averageRating: b.rating,
            followersCount: b.followers,
            location: { city: b.city, state: b.city, address: `${b.city} Industrial Area` }
        });

        await BuilderProfile.create({
            user: user._id,
            companyName: b.companyName,
            profileType: 'Builder Company',
            yearsOfExperience: b.exp,
            officeAddress: `${b.city} Tech Park, Suite 402`,
            serviceAreas: [b.city, 'Pan-India'],
            professionalDetails: {
                servicesOffered: b.services,
                pricingModel: 'fixed',
                teamSize: 45
            },
            averageRating: b.rating,
            followersCount: b.followers,
            isProfileActive: true
        });
    }

    // 2. ARCHITECTS & ENGINEERS (5 profiles)
    const architectsData = [
        {
            name: 'Ar. Rajesh Malhotra',
            email: 'architect1.dummy@infralink.com',
            profession: 'Architect',
            city: 'Delhi NCR',
            exp: 12,
            skills: ['3D Modeling', 'Modern Sustainable Architecture', 'BIM Design'],
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            rating: 4.9
        },
        {
            name: 'Eng. Priya Sundaram',
            email: 'architect2.dummy@infralink.com',
            profession: 'Structural Engineer',
            city: 'Chennai',
            exp: 9,
            skills: ['RCC Structure Design', 'Earthquake Resistance', 'Steel Framework'],
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
            rating: 4.7
        },
        {
            name: 'Ar. Ananya Deshmukh',
            email: 'architect3.dummy@infralink.com',
            profession: 'Interior Designer',
            city: 'Mumbai',
            exp: 7,
            skills: ['Luxury Residential Interiors', 'Space Optimization', 'Modular Design'],
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            rating: 4.8
        },
        {
            name: 'Eng. Vikramaditya Verma',
            email: 'architect4.dummy@infralink.com',
            profession: 'Civil Engineer',
            city: 'Kolkata',
            exp: 15,
            skills: ['Bridge Construction', 'Site Supervision', 'Quantity Surveying'],
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            rating: 4.6
        },
        {
            name: 'Ar. Rohan Mehta',
            email: 'architect5.dummy@infralink.com',
            profession: 'Architect',
            city: 'Ahmedabad',
            exp: 11,
            skills: ['Commercial Blueprinting', 'Landscape Architecture', 'Urban Planning'],
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
            rating: 4.9
        }
    ];

    for (const a of architectsData) {
        await User.create({
            name: a.name,
            email: a.email,
            password: hashedPwd,
            role: 'architect',
            professionType: a.profession,
            isVerified: true,
            isActive: true,
            avatar: a.avatar,
            profilePic: a.avatar,
            skills: a.skills,
            experience: `${a.exp} Years`,
            averageRating: a.rating,
            followersCount: Math.floor(Math.random() * 80) + 40,
            location: { city: a.city, state: a.city, address: `${a.city} Design District` }
        });
    }

    // 3. CONTRACTORS (5 profiles)
    const contractorsData = [
        {
            name: 'Sharma Electrical & MEP Contractors',
            email: 'contractor1.dummy@infralink.com',
            type: 'Electrical Contractor',
            city: 'Delhi NCR',
            exp: 11,
            services: ['High Voltage Wiring', 'Transformer Installation', 'Substation Work'],
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            rating: 4.8
        },
        {
            name: 'Verma Civil & Waterproofing Works',
            email: 'contractor2.dummy@infralink.com',
            type: 'Civil Contractor',
            city: 'Jaipur',
            exp: 13,
            services: ['Foundation RCC', 'Terrace Waterproofing', 'Concrete Slab Work'],
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
            rating: 4.7
        },
        {
            name: 'Elite Interior & Carpentry Solutions',
            email: 'contractor3.dummy@infralink.com',
            type: 'Interior Contractor',
            city: 'Bengaluru',
            exp: 8,
            services: ['Woodwork', 'False Ceiling', 'Modular Kitchen Setup'],
            avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
            rating: 4.9
        },
        {
            name: 'National Plumbing & Piping Infra',
            email: 'contractor4.dummy@infralink.com',
            type: 'Plumbing Contractor',
            city: 'Pune',
            exp: 10,
            services: ['Commercial Drainage', 'CPVC Fitting', 'Fire Sprinkler Systems'],
            avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
            rating: 4.6
        },
        {
            name: 'Titan Fabrication & Steel Structuring',
            email: 'contractor5.dummy@infralink.com',
            type: 'Fabrication / Welding Contractor',
            city: 'Surat',
            exp: 14,
            services: ['Shed Fabrication', 'Heavy Structural Welding', 'Grill & Gate Fitting'],
            avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            rating: 4.8
        }
    ];

    for (const c of contractorsData) {
        const user = await User.create({
            name: c.name,
            email: c.email,
            password: hashedPwd,
            role: 'contractor',
            contractorType: c.type,
            isVerified: true,
            isActive: true,
            avatar: c.avatar,
            profilePic: c.avatar,
            skills: c.services,
            averageRating: c.rating,
            followersCount: Math.floor(Math.random() * 90) + 30,
            location: { city: c.city, state: c.city, address: `${c.city} Industrial Hub` }
        });

        await ContractorProfile.create({
            user: user._id,
            fullName: c.name,
            experience: c.exp,
            completedProjects: Math.floor(Math.random() * 30) + 15,
            ongoingProjects: Math.floor(Math.random() * 5) + 1,
            professionalDetails: {
                services: c.services,
                skillLevel: 'expert'
            },
            averageRating: c.rating,
            isProfileActive: true
        });
    }

    // 4. SKILLED LABOUR / WORKERS (5 profiles)
    const workersData = [
        {
            name: 'Ramesh Kumar Mistry',
            email: 'labour1.dummy@infralink.com',
            trade: 'Mason / Tile Layer',
            city: 'Delhi NCR',
            exp: 8,
            skills: ['Brick Masonry', 'Granite & Marble Fitting', 'Plastering'],
            dailyRate: 850,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            rating: 4.8
        },
        {
            name: 'Sunil Electrician',
            email: 'labour2.dummy@infralink.com',
            trade: 'Electrician',
            city: 'Noida',
            exp: 6,
            skills: ['House Wiring', 'MCB Box Installation', 'Inverter Setup'],
            dailyRate: 750,
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            rating: 4.7
        },
        {
            name: 'Mohammad Imran Plumber',
            email: 'labour3.dummy@infralink.com',
            trade: 'Plumber',
            city: 'Gurugram',
            exp: 7,
            skills: ['Sanitary Ware Fitting', 'Water Line Piping', 'Leakage Repair'],
            dailyRate: 800,
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            rating: 4.9
        },
        {
            name: 'Gurpreet Singh Welder',
            email: 'labour4.dummy@infralink.com',
            trade: 'Welder & Fabricator',
            city: 'Chandigarh',
            exp: 10,
            skills: ['ARC Welding', 'TIG Welding', 'Railing Fabrication'],
            dailyRate: 900,
            avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
            rating: 4.8
        },
        {
            name: 'Santosh Painter',
            email: 'labour5.dummy@infralink.com',
            trade: 'Painter',
            city: 'Faridabad',
            exp: 5,
            skills: ['Emulsion Paint', 'Texture Design', 'Putty Work'],
            dailyRate: 700,
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            rating: 4.6
        }
    ];

    for (const w of workersData) {
        const user = await User.create({
            name: w.name,
            email: w.email,
            password: hashedPwd,
            role: 'labour',
            isVerified: true,
            isActive: true,
            avatar: w.avatar,
            profilePic: w.avatar,
            skills: w.skills,
            experience: `${w.exp} Years`,
            averageRating: w.rating,
            location: { city: w.city, state: w.city, address: `${w.city} Labour Chowk` }
        });

        await WorkerProfile.create({
            user: user._id,
            trade: w.trade,
            skills: w.skills,
            yearsOfExperience: w.exp,
            dailyRate: w.dailyRate,
            hourlyRate: Math.round(w.dailyRate / 8),
            averageRating: w.rating,
            isAvailable: true,
            completedJobs: Math.floor(Math.random() * 25) + 10,
            bio: `Experienced ${w.trade} available for residential and commercial construction tasks in ${w.city}.`
        });
    }

    // 5. SUPPLIERS & MARKETPLACE (5 profiles)
    const suppliersData = [
        {
            name: 'Ambuja & UltraTech Wholesale Hub',
            email: 'supplier1.dummy@infralink.com',
            businessName: 'NCR Cement & Building Materials Depot',
            category: 'Cement Supplier',
            city: 'Delhi NCR',
            exp: 15,
            avatar: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
            rating: 4.9
        },
        {
            name: 'Jindal Panther & TATA TMT Steel Mart',
            email: 'supplier2.dummy@infralink.com',
            businessName: 'Bharat Steel Traders',
            category: 'Steel Supplier',
            city: 'Mumbai',
            exp: 20,
            avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80',
            rating: 4.8
        },
        {
            name: 'Kajaria & Somany Tiles Emporium',
            email: 'supplier3.dummy@infralink.com',
            businessName: 'Royal Ceramics & Flooring',
            category: 'Tiles & Flooring',
            city: 'Ahmedabad',
            exp: 12,
            avatar: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=150&auto=format&fit=crop&q=80',
            rating: 4.7
        },
        {
            name: 'Havells & Polycab Electrical Distributors',
            email: 'supplier4.dummy@infralink.com',
            businessName: 'PowerLine Electrical Supplies',
            category: 'Electrical Materials',
            city: 'Bengaluru',
            exp: 10,
            avatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=80',
            rating: 4.9
        },
        {
            name: 'Red Clay Bricks & River Sand Depot',
            email: 'supplier5.dummy@infralink.com',
            businessName: 'Greenfield Aggregate Suppliers',
            category: 'Sand / Aggregates',
            city: 'Pune',
            exp: 9,
            avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=150&auto=format&fit=crop&q=80',
            rating: 4.6
        }
    ];

    for (const s of suppliersData) {
        const user = await User.create({
            name: s.name,
            email: s.email,
            password: hashedPwd,
            role: 'supplier',
            isVerified: true,
            isActive: true,
            avatar: s.avatar,
            profilePic: s.avatar,
            skills: [s.category],
            averageRating: s.rating,
            location: { city: s.city, state: s.city, address: `${s.city} Wholesale Market` }
        });

        await SupplierProfile.create({
            user: user._id,
            businessName: s.businessName,
            ownerName: s.name,
            location: {
                address: `${s.city} Industrial Area, Gate 2`,
                city: s.city,
                pincode: '110001',
                serviceAreas: [s.city, 'Statewide']
            },
            categories: [s.category],
            verification: {
                gstNumber: '07AAAAA0000A1Z5',
                yearsOfExperience: s.exp,
                verifiedBadge: true
            },
            reputation: {
                averageRating: s.rating,
                totalOrders: Math.floor(Math.random() * 200) + 50,
                repeatClients: Math.floor(Math.random() * 40) + 10
            },
            isProfileActive: true
        });
    }

    console.log('🎉 ALL 25 DUMMY PROFILES CREATED SUCCESSFULLY!');
    return { success: true, count: 25 };
};

if (import.meta.url === `file://${process.argv[1]}`) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => runSeedProfiles())
        .then(() => mongoose.disconnect())
        .catch(err => { console.error(err); process.exit(1); });
}
