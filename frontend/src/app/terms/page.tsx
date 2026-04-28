import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ background: '#070b14', color: '#e8eaf6', fontFamily: 'DM Sans, sans-serif', minHeight: '100vh' }}>
      <nav className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Remindly</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm" style={{ color: '#8892b0' }}>
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Terms of Service</h1>
        <p className="text-sm mb-12" style={{ color: '#4a5568' }}>Last updated: January 2025</p>

        {[
          { title: '1. Acceptance of Terms', content: 'By creating an account and using Remindly, you agree to these Terms of Service. If you do not agree, please do not use the service. We reserve the right to update these terms at any time with notice provided through the app.' },
          { title: '2. Use of Service', content: 'Remindly is provided for personal educational use. You may use it to create notes, generate flashcards, and track your study progress. You must not use the service for any illegal purpose, to upload harmful content, or to attempt to compromise the security of the platform.' },
          { title: '3. Your Account', content: 'You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized access. You must be at least 13 years old to create an account. One person may not maintain multiple accounts.' },
          { title: '4. Your Content', content: 'You own all notes and flashcards you create in Remindly. By using the service, you grant us a limited license to store and process your content solely to provide the service. We do not claim ownership of your content and will not use it for any other purpose.' },
          { title: '5. AI-Generated Content', content: 'AI flashcard generation uses your note content to produce flashcards. The quality and accuracy of AI-generated content may vary. You are responsible for reviewing generated flashcards for accuracy. We are not liable for errors in AI-generated content.' },
          { title: '6. Service Availability', content: 'We strive to provide 99%+ uptime but cannot guarantee uninterrupted service. We may perform maintenance that temporarily interrupts the service. We are not liable for any loss of data or productivity resulting from service interruptions.' },
          { title: '7. Limitation of Liability', content: 'Remindly is provided "as is" without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid in the last 12 months.' },
          { title: '8. Termination', content: 'You may delete your account at any time. We reserve the right to terminate accounts that violate these terms. Upon termination, your data will be deleted from our systems within 30 days.' },
          { title: '9. Contact', content: 'For questions about these terms, contact us at: legal@remindly.app' },
        ].map(({ title, content }) => (
          <div key={title} className="mb-10">
            <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#a5b4fc' }}>{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#8892b0' }}>{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}