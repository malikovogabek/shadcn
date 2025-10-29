# Ashyoviy Dalillar Hisobi - MVP Todo List

## Core Features to Implement

### 1. Authentication & Role Management
- [ ] Login page with role selection (Administrator, Tergovchi, Rahbariyat)
- [ ] User authentication context
- [ ] Role-based routing and access control
- [ ] Mock user data with different roles

### 2. Dashboard Layouts
- [ ] Sidebar navigation component
- [ ] Top navigation bar
- [ ] Role-based color schemes (Administrator: blue, Tergovchi: green, Rahbariyat: gray)
- [ ] Main layout wrapper

### 3. Administrator Panel
- [ ] Users management page (view, add, edit, delete users)
- [ ] Statistics dashboard (total evidence, investigators, active cases)
- [ ] User table with export functionality

### 4. Tergovchi (Investigator) Panel
- [ ] Add new evidence form with all required fields
- [ ] My cases page (view own evidence)
- [ ] Expiring evidence alerts
- [ ] Evidence completion functionality

### 5. Rahbariyat (Management) Panel
- [ ] View all evidence (read-only)
- [ ] Search and filter functionality
- [ ] Expiring evidence monitoring
- [ ] Investigator activity logs

### 6. Data Models & Storage
- [ ] User model (localStorage for MVP)
- [ ] Evidence model with all required fields
- [ ] Activity logs model
- [ ] Mock data initialization

### 7. File Management
- [ ] File upload component for evidence files and images
- [ ] File preview functionality
- [ ] Multiple image upload support

### 8. UI Components
- [ ] Evidence cards/table components
- [ ] Modal dialogs for forms
- [ ] Alert components for expiring evidence
- [ ] Search and filter components

## File Structure Plan
1. `src/types/index.ts` - TypeScript interfaces
2. `src/contexts/AuthContext.tsx` - Authentication context
3. `src/components/Layout/` - Layout components
4. `src/components/Evidence/` - Evidence-related components
5. `src/components/Users/` - User management components
6. `src/pages/Login.tsx` - Login page
7. `src/pages/Dashboard/` - Role-specific dashboards
8. `src/lib/mockData.ts` - Mock data for development