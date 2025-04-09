import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | InvestAssist',
  description: 'Terms of Service for InvestAssist - Your investment analysis platform',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using InvestAssist, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms,
            you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily access and use InvestAssist for personal,
            non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on InvestAssist</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
          <p>
            The materials on InvestAssist are provided on an &apos;as is&apos; basis. InvestAssist
            makes no warranties, expressed or implied, and hereby disclaims and negates all other
            warranties including, without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or non-infringement of intellectual
            property or other violation of rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
          <p>
            In no event shall InvestAssist or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business
            interruption) arising out of the use or inability to use the materials on InvestAssist.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Revisions and Errata</h2>
          <p>
            The materials appearing on InvestAssist could include technical, typographical, or
            photographic errors. InvestAssist does not warrant that any of the materials on its
            website are accurate, complete, or current. InvestAssist may make changes to the
            materials contained on its website at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us through
            our support channels.
          </p>
        </section>
      </div>
    </div>
  )
} 