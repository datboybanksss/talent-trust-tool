-- Create compliance reminders table
CREATE TABLE public.compliance_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_time TEXT DEFAULT '09:00',
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('urgent', 'warning', 'info')),
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT CHECK (recurring_interval IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email notifications log table
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID REFERENCES public.compliance_reminders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'opened')),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_reminders
CREATE POLICY "Users can view their own reminders"
ON public.compliance_reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
ON public.compliance_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
ON public.compliance_reminders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
ON public.compliance_reminders FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for email_notifications
CREATE POLICY "Users can view their own email notifications"
ON public.email_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email notifications"
ON public.email_notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role can insert email notifications (for edge function)
CREATE POLICY "Service role can manage email notifications"
ON public.email_notifications FOR ALL
USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_compliance_reminder_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_compliance_reminders_updated_at
BEFORE UPDATE ON public.compliance_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_compliance_reminder_timestamp();

-- Create indexes for performance
CREATE INDEX idx_compliance_reminders_user_id ON public.compliance_reminders(user_id);
CREATE INDEX idx_compliance_reminders_due_date ON public.compliance_reminders(due_date);
CREATE INDEX idx_compliance_reminders_status ON public.compliance_reminders(status);
CREATE INDEX idx_email_notifications_user_id ON public.email_notifications(user_id);
CREATE INDEX idx_email_notifications_reminder_id ON public.email_notifications(reminder_id);