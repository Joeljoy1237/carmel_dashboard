
import Sidebar from '@/widget/dashboard/Sidebar'

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[15vw]">{children}</main>
    </div>
  )
}


export default layout