import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — PayJobs.work",
  description:
    "How PayJobs.work Manpower Services collects, uses, and protects information through the AI Hiring Assistant platform.",
};

const EFFECTIVE_DATE = "July 3, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        This Privacy Policy explains how{" "}
        <strong>PayJobs.work Manpower Services</strong> (&ldquo;PayJobs.work,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) handles
        information in connection with the PayJobs.work website, AI Hiring
        Assistant, and AI Profile Assistant (the &ldquo;Service&rdquo;). We
        wrote this to reflect what the Service actually does today, not a
        generic template — as we add features like accounts and an
        application/interview pipeline, this Policy will be updated
        accordingly.
      </p>

      <section className="flex flex-col gap-2">
        <h2>1. Information You Provide</h2>
        <p>
          When you use the AI Hiring Assistant or the AI Profile Assistant,
          you may type in a description of the role you&apos;re hiring for or
          the work you do, answer follow-up questions, or enter a search
          query. This content is sent to our servers to generate a response
          and, where AI features are involved, is sent to our AI provider as
          described in Section 3 below.
        </p>
        <p>
          If you choose to <strong>post a job</strong>, we store your company
          name, contact email or phone number, and the full job brief
          (title, responsibilities, skills, salary range, interview
          questions) in our database. If you choose to{" "}
          <strong>publish a candidate profile</strong>, we store your name,
          contact email or phone number, and the details you shared about
          your work in our database. Neither action is required just to use
          the AI Hiring Assistant or browse — only if you explicitly click
          &ldquo;Post job&rdquo; or &ldquo;Publish my profile,&rdquo; at which
          point you&apos;ll also be asked to sign in as described in Section
          2.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>2. Account Sign-In (Google or Facebook)</h2>
        <p>
          Posting a job or publishing a candidate profile requires signing in
          with a Google or Facebook account, handled through our
          authentication provider (Supabase Auth). Browsing the Service,
          chatting with the AI Hiring Assistant or AI Profile Assistant, and
          viewing posted jobs or published profiles do not require signing
          in.
        </p>
        <p>
          When you sign in, Google or Facebook shares your email address,
          display name, and profile picture URL with us; we store these to
          identify your account and associate it with any job or profile you
          post. We never see or receive your Google or Facebook password. A
          session cookie is set in your browser to keep you signed in, as
          described in Section 8.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>3. Public Visibility — No Privacy Controls Yet</h2>
        <p>
          Signing in identifies who posted a job or published a profile, but
          it does not restrict who can see it. A posted job (including the
          employer&apos;s company name and contact details) is visible to
          anyone who visits the &ldquo;Find Work&rdquo; page, and a published
          candidate profile (including the person&apos;s name and contact
          details) is visible to anyone who visits the &ldquo;Find
          Talent&rdquo; page or that profile&apos;s page directly. There is
          currently no way to restrict who can view this information, or a
          self-service way to take it down, once it&apos;s posted or
          published. Do not include information you&apos;re not comfortable
          making public.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>4. Information Stored on Your Device</h2>
        <p>Separately from the database storage above:</p>
        <ul className="list-disc pl-5">
          <li>
            Your theme preference (light or dark) is saved in your
            browser&apos;s local storage so it persists between visits.
          </li>
          <li>
            While you&apos;re mid-conversation with the AI Hiring Assistant,
            the resulting job brief is temporarily saved in your
            browser&apos;s session storage so the candidate matching page can
            use it — this copy stays on your device and is cleared when you
            close the tab. It is separate from, and unrelated to, the
            permanent copy saved to our database if you click &ldquo;Post
            job.&rdquo;
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2>5. AI Processing by Third-Party Providers</h2>
        <p>
          The AI Hiring Assistant, AI Profile Assistant, candidate/job
          matching, and AI fit summaries are powered by Anthropic (Claude
          models). Text you submit through these features — including your
          conversation, job brief, profile details, or search query — is sent
          to Anthropic&apos;s API to generate a response. We do not control
          how long Anthropic retains this data independent of our API
          configuration; you can review{" "}
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anthropic&apos;s Privacy Policy
          </a>{" "}
          for details. Anthropic may process data on servers located outside
          the Philippines.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>6. Where Data Is Stored</h2>
        <p>
          Posted jobs, published candidate profiles, and account information
          from Google/Facebook sign-in (email, display name, profile picture
          URL) are stored in a managed Postgres database (Supabase), hosted
          outside the Philippines. Only our own servers can write to or read
          this database directly — it is not exposed to the browser. Our
          servers also briefly use your IP address to enforce request-rate
          limits on AI features; this is held in server memory only, never
          written to the database, and discarded automatically (and reset
          entirely whenever the server restarts).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>7. What We Do Not Currently Collect</h2>
        <p>
          As of the effective date above, the Service does not collect or
          store passwords (sign-in is handled entirely by Google or
          Facebook), does not collect payment information, and does not yet
          track which candidates applied to which job (there is no
          application/interview pipeline built yet). If this changes as new
          features launch, we will update this Policy before those features
          go live.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>8. Cookies</h2>
        <p>
          Signing in sets a session cookie so the Service can recognize
          you&apos;re signed in on future requests; it is not used for
          advertising or cross-site tracking. The only other client-side
          storage used is the local/session storage described in Section 4.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>9. How We Use Information</h2>
        <p>We use the information described above only to:</p>
        <ul className="list-disc pl-5">
          <li>Operate and respond to requests made through the AI Hiring Assistant, AI Profile Assistant, and search/matching features;</li>
          <li>Recognize you when you sign in and associate posted jobs or published profiles with your account;</li>
          <li>Display posted jobs and published profiles to other visitors, as described in Section 3;</li>
          <li>Maintain the security and reliability of the Service; and</li>
          <li>Improve the Service&apos;s features and prompts over time.</li>
        </ul>
        <p>We do not sell your information.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>10. Your Rights Under the Data Privacy Act</h2>
        <p>
          If you are in the Philippines, you have rights under the Data
          Privacy Act of 2012 (Republic Act No. 10173), including the right
          to be informed, to access, to object, to correct, and to erasure
          or blocking of your personal data, where applicable. There is no
          self-service way to edit or delete a posted job or published
          profile yet — to request removal or correction of a job post or
          candidate profile, or to have your account&apos;s sign-in data
          deleted, contact us using the details in Section 14, or file a
          complaint with the{" "}
          <a
            href="https://privacy.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
          >
            National Privacy Commission
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>11. Children&apos;s Privacy</h2>
        <p>
          The Service is intended for use by individuals 18 years of age or
          older. We do not knowingly collect information from children.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>12. Data Security</h2>
        <p>
          We take reasonable measures to protect information transmitted to
          and stored by our servers, including transmitting data over
          encrypted connections and restricting database write access to our
          own backend. Sign-in is handled by Google or Facebook — we never
          receive or store your password on either platform. No method of
          transmission or storage is completely secure, and we cannot
          guarantee absolute security.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>13. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy as the Service evolves,
          particularly as we introduce an application/interview pipeline.
          Material changes will be reflected by updating the effective date
          above.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2>14. Contact Us</h2>
        <p>
          Questions about this Policy, or requests to remove or correct a
          posted job or candidate profile, can be sent to{" "}
          <a href="mailto:privacy@payjobs.work">privacy@payjobs.work</a>.
        </p>
        <p className="text-xs text-muted-foreground">
          PayJobs.work Manpower Services — [Insert registered business
          address]
        </p>
      </section>
    </LegalPageShell>
  );
}
