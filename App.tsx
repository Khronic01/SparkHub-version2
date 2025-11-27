
import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';

// Import pages
import HomePage from './app/page';
import FeedPage from './app/feed/page';
import AdminPage from './app/admin/page';
import AdminUsersPage from './app/admin/users/page';
import AdminTasksPage from './app/admin/tasks/page';
import AdminPaymentsPage from './app/admin/payments/page';
import AdminDisputesPage from './app/admin/disputes/page';

import CreateIdeaPage from './app/ideas/create/page';
import IdeaDetailPage from './app/ideas/[id]/page';
import TaskDetailPage from './app/tasks/[id]/page';
import MarketplacePage from './app/marketplace/page';
import MarketplaceNewPage from './app/marketplace/new/page';
import MarketplaceItemPage from './app/marketplace/[id]/page';
import ProfilePage from './app/profile/page';

// Messages
import MessagesLayout from './app/messages/layout';
import MessagesIndexPage from './app/messages/page';
import ConversationPage from './app/messages/[id]/page';

// Auth
import SigninPage from './app/auth/signin/page';
import SignupPage from './app/auth/signup/page';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes (Outside Layout) */}
        <Route path="/auth/signin" element={<SigninPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        {/* Protected App Routes */}
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<HomePage />} />
          <Route path="feed" element={<FeedPage />} />
          
          {/* Admin Routes */}
          <Route path="admin">
            <Route index element={<AdminPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="disputes" element={<AdminDisputesPage />} />
          </Route>

          <Route path="ideas">
            <Route path="create" element={<CreateIdeaPage />} />
            <Route path=":id" element={<IdeaDetailPage />} />
          </Route>
          <Route path="tasks">
            <Route path=":id" element={<TaskDetailPage />} />
          </Route>
          
          {/* Marketplace Routes */}
          <Route path="marketplace">
            <Route index element={<MarketplacePage />} />
            <Route path="new" element={<MarketplaceNewPage />} />
            <Route path=":id" element={<MarketplaceItemPage />} />
          </Route>
          
          {/* Nested Messages Routes */}
          <Route path="messages" element={<MessagesLayout />}>
             <Route index element={<MessagesIndexPage />} />
             <Route path=":id" element={<ConversationPage />} />
          </Route>

          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
