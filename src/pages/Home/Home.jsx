import Navbar from "../../components/navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Stats from "../../components/Stats/Stats";
import DashboardPreview from "../../components/DashboardPreview/DashboardPreview";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <DashboardPreview />
    </>
  );
}