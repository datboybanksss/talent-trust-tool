
-- 1. Add missing DELETE policies
CREATE POLICY "Users can delete their own agent profile"
ON public.agent_manager_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Agents can delete their own invitations"
ON public.client_invitations FOR DELETE
TO authenticated
USING (auth.uid() = agent_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription"
ON public.user_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Tighten public -> authenticated on tables that should require login

-- agent_manager_profiles: change 3 existing policies from public to authenticated
DROP POLICY IF EXISTS "Users can insert their own agent profile" ON public.agent_manager_profiles;
CREATE POLICY "Users can insert their own agent profile" ON public.agent_manager_profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own agent profile" ON public.agent_manager_profiles;
CREATE POLICY "Users can update their own agent profile" ON public.agent_manager_profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own agent profile" ON public.agent_manager_profiles;
CREATE POLICY "Users can view their own agent profile" ON public.agent_manager_profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- social_media_accounts
DROP POLICY IF EXISTS "Users can create their own social accounts" ON public.social_media_accounts;
CREATE POLICY "Users can create their own social accounts" ON public.social_media_accounts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own social accounts" ON public.social_media_accounts;
CREATE POLICY "Users can delete their own social accounts" ON public.social_media_accounts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own social accounts" ON public.social_media_accounts;
CREATE POLICY "Users can update their own social accounts" ON public.social_media_accounts
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own social accounts" ON public.social_media_accounts;
CREATE POLICY "Users can view their own social accounts" ON public.social_media_accounts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- beneficiaries
DROP POLICY IF EXISTS "Users can create their own beneficiaries" ON public.beneficiaries;
CREATE POLICY "Users can create their own beneficiaries" ON public.beneficiaries
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own beneficiaries" ON public.beneficiaries;
CREATE POLICY "Users can delete their own beneficiaries" ON public.beneficiaries
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own beneficiaries" ON public.beneficiaries;
CREATE POLICY "Users can update their own beneficiaries" ON public.beneficiaries
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own beneficiaries" ON public.beneficiaries;
CREATE POLICY "Users can view their own beneficiaries" ON public.beneficiaries
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- emergency_contacts
DROP POLICY IF EXISTS "Users can create their own emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Users can create their own emergency contacts" ON public.emergency_contacts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Users can delete their own emergency contacts" ON public.emergency_contacts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Users can update their own emergency contacts" ON public.emergency_contacts
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Users can view their own emergency contacts" ON public.emergency_contacts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- life_file_documents
DROP POLICY IF EXISTS "Users can create their own life file documents" ON public.life_file_documents;
CREATE POLICY "Users can create their own life file documents" ON public.life_file_documents
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own life file documents" ON public.life_file_documents;
CREATE POLICY "Users can delete their own life file documents" ON public.life_file_documents
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own life file documents" ON public.life_file_documents;
CREATE POLICY "Users can update their own life file documents" ON public.life_file_documents
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own life file documents" ON public.life_file_documents;
CREATE POLICY "Users can view their own life file documents" ON public.life_file_documents
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- life_file_assets
DROP POLICY IF EXISTS "Users can create their own assets" ON public.life_file_assets;
CREATE POLICY "Users can create their own assets" ON public.life_file_assets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own assets" ON public.life_file_assets;
CREATE POLICY "Users can delete their own assets" ON public.life_file_assets
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own assets" ON public.life_file_assets;
CREATE POLICY "Users can update their own assets" ON public.life_file_assets
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own assets" ON public.life_file_assets;
CREATE POLICY "Users can view their own assets" ON public.life_file_assets
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- life_file_shares
DROP POLICY IF EXISTS "Owners can create shares" ON public.life_file_shares;
CREATE POLICY "Owners can create shares" ON public.life_file_shares
FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their shares" ON public.life_file_shares;
CREATE POLICY "Owners can delete their shares" ON public.life_file_shares
FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their shares" ON public.life_file_shares;
CREATE POLICY "Owners can update their shares" ON public.life_file_shares
FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can view their shares" ON public.life_file_shares;
CREATE POLICY "Owners can view their shares" ON public.life_file_shares
FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Recipients can update their share status" ON public.life_file_shares;
CREATE POLICY "Recipients can update their share status" ON public.life_file_shares
FOR UPDATE TO authenticated USING (auth.uid() = shared_with_user_id);

DROP POLICY IF EXISTS "Recipients can view shares they received" ON public.life_file_shares;
CREATE POLICY "Recipients can view shares they received" ON public.life_file_shares
FOR SELECT TO authenticated USING (auth.uid() = shared_with_user_id);

-- shared_access
DROP POLICY IF EXISTS "Owners can create shares" ON public.shared_access;
CREATE POLICY "Owners can create shares" ON public.shared_access
FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their shares" ON public.shared_access;
CREATE POLICY "Owners can delete their shares" ON public.shared_access
FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their shares" ON public.shared_access;
CREATE POLICY "Owners can update their shares" ON public.shared_access
FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can view their shares" ON public.shared_access;
CREATE POLICY "Owners can view their shares" ON public.shared_access
FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Recipients can view shares" ON public.shared_access;
CREATE POLICY "Recipients can view shares" ON public.shared_access
FOR SELECT TO authenticated USING (auth.uid() = shared_with_user_id);

-- client_invitations
DROP POLICY IF EXISTS "Agents can create invitations" ON public.client_invitations;
CREATE POLICY "Agents can create invitations" ON public.client_invitations
FOR INSERT TO authenticated WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Agents can update their own invitations" ON public.client_invitations;
CREATE POLICY "Agents can update their own invitations" ON public.client_invitations
FOR UPDATE TO authenticated USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Agents can view their own invitations" ON public.client_invitations;
CREATE POLICY "Agents can view their own invitations" ON public.client_invitations
FOR SELECT TO authenticated USING (auth.uid() = agent_id);

-- profiles: tighten insert/update
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- artist_projects
DROP POLICY IF EXISTS "Users can create their own projects" ON public.artist_projects;
CREATE POLICY "Users can create their own projects" ON public.artist_projects
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.artist_projects;
CREATE POLICY "Users can delete their own projects" ON public.artist_projects
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.artist_projects;
CREATE POLICY "Users can update their own projects" ON public.artist_projects
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own projects" ON public.artist_projects;
CREATE POLICY "Users can view their own projects" ON public.artist_projects
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- artist_royalties
DROP POLICY IF EXISTS "Users can create their own royalties" ON public.artist_royalties;
CREATE POLICY "Users can create their own royalties" ON public.artist_royalties
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own royalties" ON public.artist_royalties;
CREATE POLICY "Users can delete their own royalties" ON public.artist_royalties
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own royalties" ON public.artist_royalties;
CREATE POLICY "Users can update their own royalties" ON public.artist_royalties
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own royalties" ON public.artist_royalties;
CREATE POLICY "Users can view their own royalties" ON public.artist_royalties
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- athlete_contracts
DROP POLICY IF EXISTS "Users can create their own contracts" ON public.athlete_contracts;
CREATE POLICY "Users can create their own contracts" ON public.athlete_contracts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own contracts" ON public.athlete_contracts;
CREATE POLICY "Users can delete their own contracts" ON public.athlete_contracts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contracts" ON public.athlete_contracts;
CREATE POLICY "Users can update their own contracts" ON public.athlete_contracts
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own contracts" ON public.athlete_contracts;
CREATE POLICY "Users can view their own contracts" ON public.athlete_contracts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- athlete_endorsements
DROP POLICY IF EXISTS "Users can create their own endorsements" ON public.athlete_endorsements;
CREATE POLICY "Users can create their own endorsements" ON public.athlete_endorsements
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own endorsements" ON public.athlete_endorsements;
CREATE POLICY "Users can delete their own endorsements" ON public.athlete_endorsements
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own endorsements" ON public.athlete_endorsements;
CREATE POLICY "Users can update their own endorsements" ON public.athlete_endorsements
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own endorsements" ON public.athlete_endorsements;
CREATE POLICY "Users can view their own endorsements" ON public.athlete_endorsements
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- compliance_reminders
DROP POLICY IF EXISTS "Users can create their own reminders" ON public.compliance_reminders;
CREATE POLICY "Users can create their own reminders" ON public.compliance_reminders
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.compliance_reminders;
CREATE POLICY "Users can delete their own reminders" ON public.compliance_reminders
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reminders" ON public.compliance_reminders;
CREATE POLICY "Users can update their own reminders" ON public.compliance_reminders
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own reminders" ON public.compliance_reminders;
CREATE POLICY "Users can view their own reminders" ON public.compliance_reminders
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- email_notifications
DROP POLICY IF EXISTS "Users can create their own email notifications" ON public.email_notifications;
CREATE POLICY "Users can create their own email notifications" ON public.email_notifications
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own email notifications" ON public.email_notifications;
CREATE POLICY "Users can view their own email notifications" ON public.email_notifications
FOR SELECT TO authenticated USING (auth.uid() = user_id);
