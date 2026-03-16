import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyInvestments from "@/components/dashboard/PropertyInvestments";

const PropertyInvestmentsPage = () => {
  return (
    <DashboardLayout 
      title="Property Investment Opportunities" 
      subtitle="Explore high-potential real estate investments"
    >
      <PropertyInvestments />
    </DashboardLayout>
  );
};

export default PropertyInvestmentsPage;
