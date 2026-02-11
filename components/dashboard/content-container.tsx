type DashboardContentContainerProps = {
  children: React.ReactNode;
};

export function DashboardContentContainer({ children }: DashboardContentContainerProps) {
  return <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>;
}
