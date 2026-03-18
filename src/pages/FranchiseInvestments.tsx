import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FranchiseInvestments from "@/components/dashboard/FranchiseInvestments";

const FranchiseInvestmentsPage = () => {
  return (
    <DashboardLayout 
      title="Franchise Investment Opportunities" 
      subtitle="Explore established South African franchise brands"
    >
      <FranchiseInvestments />
    </DashboardLayout>
  );
};

export default FranchiseInvestmentsPage;
