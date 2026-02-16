import React from 'react';
import { PropertyStats, User, ActivityLog, AdminSection } from '../../types';
import AdminStats from './AdminStats';
import ActivityFeed from './ActivityFeed';
import PendingActionsCard from './PendingActionsCard';
import UserStatsCard from './UserStatsCard';

interface DashboardHomeProps {
    stats: PropertyStats;
    users: User[];
    activities?: ActivityLog[];
    pendingVerificationsCount: number;
    pendingPaymentsCount: number;
    studentRequestsCount: number;
    onNavigate: (section: AdminSection) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
    stats,
    users,
    activities,
    pendingVerificationsCount,
    pendingPaymentsCount,
    studentRequestsCount,
    onNavigate
}) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <AdminStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <ActivityFeed
                    activities={activities}
                    maxItems={8}
                    showViewAll={true}
                    onViewAll={() => onNavigate('activity')}
                />
                <div className="space-y-6">
                    <PendingActionsCard
                        pendingProperties={stats.pending}
                        pendingVerifications={pendingVerificationsCount}
                        pendingPayments={pendingPaymentsCount}
                        pendingStudentRequests={studentRequestsCount}
                        onNavigate={onNavigate}
                    />
                    <UserStatsCard users={users} />
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
