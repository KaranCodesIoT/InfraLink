import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, 'frontend-infralink');
const srcDir = path.join(baseDir, 'src');

// 1. Clean up old role-based folders that exist from the previous scaffolding
const foldersToRemove = [
    'pages',
    'components/shared', 'components/jobs', 'components/workers', 'components/projects',
    'components/marketplace', 'components/payments', 'components/ai', 'components/admin',
    'services' // old api service layer
];

foldersToRemove.forEach(folder => {
    const fullPath = path.join(srcDir, folder);
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
});

// 2. Define the new DDD files (only the new ones, components/ui and others remain if they match)
const filesToCreate = [
    'src/routes/constants.js',
    'src/layouts/DashboardLayout.jsx',
    'src/features/auth/pages/Login.jsx',
    'src/features/auth/pages/Register.jsx',
    'src/features/auth/pages/RoleSelect.jsx',
    'src/features/auth/pages/ForgotPassword.jsx',
    'src/features/auth/pages/ResetPassword.jsx',
    'src/features/auth/pages/VerifyEmail.jsx',
    'src/features/auth/components/LoginForm.jsx',
    'src/features/auth/components/RegisterForm.jsx',
    'src/features/auth/components/OAuthButtons.jsx',
    'src/features/auth/hooks/useAuth.js',
    'src/features/auth/store/auth.store.js',
    'src/features/auth/services/auth.service.js',
    'src/features/auth/index.js',
    'src/features/dashboard/pages/ClientDashboard.jsx',
    'src/features/dashboard/pages/WorkerDashboard.jsx',
    'src/features/dashboard/pages/VendorDashboard.jsx',
    'src/features/dashboard/pages/AdminDashboard.jsx',
    'src/features/dashboard/components/StatsGrid.jsx',
    'src/features/dashboard/components/ActivityFeed.jsx',
    'src/features/dashboard/components/QuickActions.jsx',
    'src/features/dashboard/components/WelcomeBanner.jsx',
    'src/features/dashboard/index.js',
    'src/features/jobs/pages/JobBoard.jsx',
    'src/features/jobs/pages/PostJob.jsx',
    'src/features/jobs/pages/MyJobs.jsx',
    'src/features/jobs/pages/JobDetail.jsx',
    'src/features/jobs/pages/MyApplications.jsx',
    'src/features/jobs/components/JobCard.jsx',
    'src/features/jobs/components/JobForm.jsx',
    'src/features/jobs/components/JobFilters.jsx',
    'src/features/jobs/components/JobStatusBadge.jsx',
    'src/features/jobs/components/ApplicationCard.jsx',
    'src/features/jobs/hooks/useJobs.js',
    'src/features/jobs/hooks/useApplications.js',
    'src/features/jobs/store/job.store.js',
    'src/features/jobs/services/job.service.js',
    'src/features/jobs/services/application.service.js',
    'src/features/jobs/index.js',
    'src/features/projects/pages/MyProjects.jsx',
    'src/features/projects/pages/ActiveProjects.jsx',
    'src/features/projects/pages/ProjectDetail.jsx',
    'src/features/projects/pages/CreateProject.jsx',
    'src/features/projects/components/ProjectCard.jsx',
    'src/features/projects/components/ProjectForm.jsx',
    'src/features/projects/components/ProjectTimeline.jsx',
    'src/features/projects/components/MilestoneTracker.jsx',
    'src/features/projects/components/ProjectUpdateFeed.jsx',
    'src/features/projects/hooks/useProjects.js',
    'src/features/projects/hooks/useProjectSocket.js',
    'src/features/projects/store/project.store.js',
    'src/features/projects/services/project.service.js',
    'src/features/projects/index.js',
    'src/features/services/pages/BrowseServices.jsx',
    'src/features/services/pages/ServiceDetail.jsx',
    'src/features/services/pages/RequestService.jsx',
    'src/features/services/pages/MyServiceRequests.jsx',
    'src/features/services/components/ServiceCard.jsx',
    'src/features/services/components/ServiceForm.jsx',
    'src/features/services/components/ServiceRequestCard.jsx',
    'src/features/services/components/ProjectLinker.jsx',
    'src/features/services/hooks/useServices.js',
    'src/features/services/services/service.service.js',
    'src/features/services/index.js',
    'src/features/matching/pages/AIMatches.jsx',
    'src/features/matching/pages/WorkerSearch.jsx',
    'src/features/matching/components/MatchCard.jsx',
    'src/features/matching/components/MatchScoreBar.jsx',
    'src/features/matching/components/WorkerCard.jsx',
    'src/features/matching/hooks/useMatching.js',
    'src/features/matching/services/matching.service.js',
    'src/features/matching/index.js',
    'src/features/messaging/pages/Messages.jsx',
    'src/features/messaging/components/ConversationList.jsx',
    'src/features/messaging/components/ChatWindow.jsx',
    'src/features/messaging/components/MessageBubble.jsx',
    'src/features/messaging/components/MessageInput.jsx',
    'src/features/messaging/hooks/useMessages.js',
    'src/features/messaging/hooks/useChatSocket.js',
    'src/features/messaging/store/message.store.js',
    'src/features/messaging/services/message.service.js',
    'src/features/messaging/index.js',
    'src/features/notifications/components/NotificationBell.jsx',
    'src/features/notifications/components/NotificationPanel.jsx',
    'src/features/notifications/components/NotificationItem.jsx',
    'src/features/notifications/hooks/useNotifications.js',
    'src/features/notifications/hooks/useNotificationSocket.js',
    'src/features/notifications/store/notification.store.js',
    'src/features/notifications/services/notification.service.js',
    'src/features/notifications/index.js',
    'src/features/payments/pages/Payments.jsx',
    'src/features/payments/pages/PaymentDetail.jsx',
    'src/features/payments/pages/Earnings.jsx',
    'src/features/payments/components/PaymentForm.jsx',
    'src/features/payments/components/TransactionTable.jsx',
    'src/features/payments/components/EarningsChart.jsx',
    'src/features/payments/hooks/usePayments.js',
    'src/features/payments/services/payment.service.js',
    'src/features/payments/index.js',
    'src/features/reviews/pages/Reviews.jsx',
    'src/features/reviews/components/ReviewCard.jsx',
    'src/features/reviews/components/ReviewForm.jsx',
    'src/features/reviews/components/StarRating.jsx',
    'src/features/reviews/services/review.service.js',
    'src/features/reviews/index.js',
    'src/features/marketplace/pages/Browse.jsx',
    'src/features/marketplace/pages/MaterialDetail.jsx',
    'src/features/marketplace/pages/MyMaterials.jsx',
    'src/features/marketplace/pages/AddMaterial.jsx',
    'src/features/marketplace/pages/Orders.jsx',
    'src/features/marketplace/components/MaterialCard.jsx',
    'src/features/marketplace/components/MaterialForm.jsx',
    'src/features/marketplace/components/MaterialFilters.jsx',
    'src/features/marketplace/components/OrderCard.jsx',
    'src/features/marketplace/hooks/useMarketplace.js',
    'src/features/marketplace/services/materials.service.js',
    'src/features/marketplace/index.js',
    'src/features/equipment/pages/MyEquipment.jsx',
    'src/features/equipment/pages/EquipmentDetail.jsx',
    'src/features/equipment/components/EquipmentCard.jsx',
    'src/features/equipment/components/EquipmentForm.jsx',
    'src/features/equipment/services/equipment.service.js',
    'src/features/equipment/index.js',
    'src/features/profile/pages/MyProfile.jsx',
    'src/features/profile/pages/PublicProfile.jsx',
    'src/features/profile/components/ProfileForm.jsx',
    'src/features/profile/components/WorkerProfileForm.jsx',
    'src/features/profile/components/SkillsInput.jsx',
    'src/features/profile/components/AvailabilityToggle.jsx',
    'src/features/profile/components/ProfileCard.jsx',
    'src/features/profile/services/user.service.js',
    'src/features/profile/services/worker.service.js',
    'src/features/profile/index.js',
    'src/features/search/pages/SearchResults.jsx',
    'src/features/search/components/SearchBar.jsx',
    'src/features/search/components/FilterPanel.jsx',
    'src/features/search/services/search.service.js',
    'src/features/search/index.js',
    'src/features/ai/pages/AssistantPage.jsx',
    'src/features/ai/components/ChatbotWidget.jsx',
    'src/features/ai/components/ChatbotWindow.jsx',
    'src/features/ai/components/AssistantPanel.jsx',
    'src/features/ai/components/FunctionResultCard.jsx',
    'src/features/ai/components/VoiceInput.jsx',
    'src/features/ai/components/VoiceOutput.jsx',
    'src/features/ai/components/VisionUpload.jsx',
    'src/features/ai/hooks/useAssistant.js',
    'src/features/ai/hooks/useVoice.js',
    'src/features/ai/hooks/useChatbot.js',
    'src/features/ai/services/ai.service.js',
    'src/features/ai/index.js',
    'src/features/admin/pages/Users.jsx',
    'src/features/admin/pages/UserDetail.jsx',
    'src/features/admin/pages/Jobs.jsx',
    'src/features/admin/pages/Projects.jsx',
    'src/features/admin/pages/Payments.jsx',
    'src/features/admin/pages/Disputes.jsx',
    'src/features/admin/pages/Escalations.jsx',
    'src/features/admin/pages/Analytics.jsx',
    'src/features/admin/pages/Settings.jsx',
    'src/features/admin/components/StatsCard.jsx',
    'src/features/admin/components/UserTable.jsx',
    'src/features/admin/components/EscalationCard.jsx',
    'src/features/admin/components/AnalyticsChart.jsx',
    'src/features/admin/services/admin.service.js',
    'src/features/admin/index.js',
    'src/lib/axios.js',
    'src/lib/socket.js'
];

filesToCreate.forEach(file => {
    const fullPath = path.join(baseDir, file);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(fullPath)) {
        if (file.endsWith('.jsx')) {
            const fileName = path.basename(file, '.jsx');
            fs.writeFileSync(fullPath, `export default function ${fileName}() {\n  return (\n    <div>${fileName}</div>\n  );\n}\n`);
        } else {
            fs.writeFileSync(fullPath, '');
        }
    }
});

console.log('DDD Structure generated.');
