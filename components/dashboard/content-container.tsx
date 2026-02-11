type DashboardContentContainerProps = {
  children: React.ReactNode;
};

export function DashboardContentContainer({
  children
}: DashboardContentContainerProps) {
  return <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">{children}</main>;
}
