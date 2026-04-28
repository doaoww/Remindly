import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Privacy Policy</h1>
        <p className="text-sm mb-12" style={{ color: '#4a5568' }}>Last updated: January 2025</p>

        {[
          { title: '1. Information We Collect', content: 'We collect information you provide directly: your email address and password when you register, notes and flashcards you create, and your study activity (review ratings and timestamps). We do not collect any personal information beyond what is necessary to provide the service.' },
          { title: '2. How We Use Your Information', content: 'Your data is used solely to provide the Remindly service — storing your notes, generating flashcards, scheduling spaced repetition reviews, and showing your progress dashboard. We never sell, rent, or share your personal data with third parties for marketing purposes.' },
          { title: '3. Data Security', content: 'Your password is hashed using bcrypt before storage. Authentication uses JWT tokens. All data is stored on secured PostgreSQL databases hosted on Railway. We use HTTPS for all data transmission between your browser and our servers.' },
          { title: '4. AI Processing', content: 'When you use AI flashcard generation, your note content is sent to DeepSeek API to generate flashcards. DeepSeek processes this data according to their own privacy policy. We recommend not including sensitive personal information in notes you generate AI flashcards from.' },
          { title: '5. Data Retention', content: 'Your data is retained as long as your account is active. You can delete individual notes and flashcards at any time. To delete your entire account and all associated data, contact us at the email below.' },
          { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time. You can export your notes and flashcards from within the app. For account deletion requests, contact us directly.' },
          { title: '7. Contact', content: 'If you have questions about this privacy policy or your data, contact us at: privacy@remindly.app' },
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