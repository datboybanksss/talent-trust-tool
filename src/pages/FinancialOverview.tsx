import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FinancialOverview from "@/components/dashboard/FinancialOverview";

const FinancialOverviewPage = () => {
  return (
    <DashboardLayout
      title="Financial Overview"
      subtitle="Monitor your financial position and track your goals"
    >
      <FinancialOverview />
    </DashboardLayout>
  );
};

export default FinancialOverviewPage;
