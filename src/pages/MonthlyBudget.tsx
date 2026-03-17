import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MonthlyBudget from "@/components/dashboard/MonthlyBudget";

const MonthlyBudgetPage = () => {
  return (
    <DashboardLayout
      title="My Monthly Budget"
      subtitle="Plan your expenses, track spending, and manage savings provisions"
    >
      <MonthlyBudget />
    </DashboardLayout>
  );
};

export default MonthlyBudgetPage;
