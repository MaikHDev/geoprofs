import DepartmentStaffingOverview from "./_components/occupancyPerDepartment";
import LeaveReminder from "./_components/leaveReminder";

export default async function Home() {
  return (
    <>
      <DepartmentStaffingOverview />
      <LeaveReminder />
    </>
  );
}
