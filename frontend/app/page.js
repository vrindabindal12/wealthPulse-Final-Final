import LandingPage from './components/LandingPage';
import Chatbot from './components/Chatbot';

export const metadata = {
  title: "WealthPulse — The Future of Personal Finance",
  description: "Institutional-grade analytics, AI-powered insights, and cinematic design — built for the investor who demands more from every market.",
};

export default function Home() {
  return (
    <>
      <LandingPage />
      <Chatbot currentPage="home" />
    </>
  );
}
