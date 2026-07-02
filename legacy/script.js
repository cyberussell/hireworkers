const form = document.querySelector("#workSearch");
const query = document.querySelector("#workQuery");
const hint = document.querySelector("#searchHint");
const results = document.querySelector("#results");
const roleButtons = document.querySelectorAll(".mode-chip");
const supabaseConfig = window.PAYJOBS_SUPABASE;

let supabaseJobs = [];

// Fetch published jobs from Supabase on page load
async function loadJobsFromSupabase() {
  try {
    const response = await fetch(`${supabaseConfig.url}/rest/v1/job_posts?status=eq.published&is_legitimate=eq.true`, {
      headers: {
        apikey: supabaseConfig.publishableKey,
        Authorization: `Bearer ${supabaseConfig.publishableKey}`,
      },
    });
    
    if (response.ok) {
      const jobs = await response.json();
      supabaseJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        contact: job.contact_email,
        keywords: [
          job.title.toLowerCase(),
          ...(job.required_skills || []).map(s => s.toLowerCase()),
          job.work_setup?.toLowerCase() || "",
          job.schedule_type?.toLowerCase() || "",
        ].filter(Boolean),
        summary: job.description,
        pay: job.pay_type === 'salary' 
          ? `PHP ${job.pay_min.toLocaleString()}-${job.pay_max.toLocaleString()}/year`
          : `PHP ${job.pay_min}-${job.pay_max}/hr`,
        fit: job.schedule_type === 'full_time' ? 'Full-time' : 
              job.schedule_type === 'part_time' ? 'Part-time' :
              job.schedule_type === 'contract' ? 'Contract' : 'Flexible',
        workSetup: job.work_setup,
        location: job.location || 'Remote',
        skills: job.required_skills || [],
      }));
    }
  } catch (error) {
    console.log('Could not load jobs from Supabase, using defaults');
  }
}

const sampleJobs = [
  {
    title: "Virtual Assistant",
    company: "RemoteHub PH",
    contact: "hire@remotehubph.com",
    summary: "Detail-oriented VA needed for admin tasks, email management, scheduling, and data entry. Organized and proactive candidates preferred.",
    pay: "PHP 20,000–30,000/mo",
    fit: "Full-time",
    workSetup: "Remote",
    location: "Philippines",
    skills: ["Google Workspace", "Email Management", "Data Entry", "Scheduling"],
  },
  {
    title: "Social Media Manager",
    company: "BrandBoost Agency",
    contact: "jobs@brandboost.ph",
    summary: "Manage Facebook, Instagram, and TikTok for our clients. Must be skilled in content creation, scheduling, and analytics reporting.",
    pay: "PHP 25,000–40,000/mo",
    fit: "Full-time",
    workSetup: "Remote",
    location: "Philippines",
    skills: ["Facebook", "Instagram", "TikTok", "Canva", "Analytics"],
  },
  {
    title: "Customer Support Representative",
    company: "TechServe Solutions",
    contact: "careers@techserve.com",
    summary: "Handle inbound inquiries via chat and email, resolve customer issues, and escalate complex cases. Training provided.",
    pay: "PHP 120–180/hr",
    fit: "Part-time",
    workSetup: "Remote",
    location: "Philippines",
    skills: ["Customer Service", "Live Chat", "Email Support"],
  },
  {
    title: "WordPress Developer",
    company: "DigitalCraft Studios",
    contact: "dev@digitalcraft.ph",
    summary: "Build and maintain client websites using WordPress, Elementor, and WooCommerce. Basic PHP customization required. Portfolio needed.",
    pay: "PHP 35,000–55,000/mo",
    fit: "Full-time",
    workSetup: "Hybrid",
    location: "Metro Manila",
    skills: ["WordPress", "Elementor", "WooCommerce", "PHP", "CSS"],
  },
  {
    title: "Freelance Video Editor",
    company: "ContentLab PH",
    contact: "content@contentlab.ph",
    summary: "Edit short-form content for Reels, TikTok, and YouTube Shorts. Must work fast with raw footage to produce engaging clips. Project-based.",
    pay: "PHP 1,500–5,000/project",
    fit: "Freelance",
    workSetup: "Remote",
    location: "Philippines",
    skills: ["CapCut", "Adobe Premiere", "Color Grading", "Short-Form Content"],
  },
];

function renderJobCard(job) {
  const skillsHtml = job.skills
    .map(s => `<span class="skill-tag">${s}</span>`)
    .join("");
  return `
    <article class="job-card">
      <div class="job-card-header">
        <div>
          <h2 class="job-card-title">${job.title}</h2>
          <span class="job-card-company">${job.company}</span>
        </div>
        <button class="job-card-action" type="button">Apply →</button>
      </div>
      <p class="job-card-description">${job.summary}</p>
      <div class="job-card-meta">
        <span class="job-meta-chip setup">📍 ${job.workSetup} · ${job.location}</span>
        <span class="job-meta-chip pay">💰 ${job.pay}</span>
        <span class="job-meta-chip schedule">🕐 ${job.fit}</span>
      </div>
    </article>
  `;
}

function showSampleJobs() {
  hint.textContent = "Browse open positions or search by skill, schedule, or pay goal.";
  results.innerHTML = `
    <h3 class="sample-jobs-heading">Latest Job Posts</h3>
    ${sampleJobs.map(renderJobCard).join("")}
  `;
}

// Load jobs when page loads
loadJobsFromSupabase();
showSampleJobs();

function setActiveRole(activeButton) {
  roleButtons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.style.background = "";
    button.style.color = "";
    button.style.borderColor = "";
  });
  const isProvider = activeButton.textContent.trim() === "Job Provider";
  query.placeholder = isProvider
    ? "Describe the role you're hiring for — title, skills, pay, schedule..."
    : "Tell me what work you're looking for — skills, schedule, pay goal...";
}

roleButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveRole(button));
});

// Set initial placeholder based on default active role
setActiveRole(document.querySelector(".mode-chip.is-active"));

const workDatabase = [
  {
    title: "Virtual Assistant",
    keywords: ["assistant", "admin", "email", "calendar", "beginner", "home", "remote", "part-time"],
    summary: "Good for organized beginners who can handle email, scheduling, research, and simple client updates.",
    pay: "PHP 180-350/hr",
    fit: "Beginner friendly",
  },
  {
    title: "Data Entry",
    keywords: ["data", "typing", "spreadsheet", "excel", "beginner", "no experience", "simple"],
    summary: "Simple task-based work for people who are accurate, patient, and comfortable with repetitive lists.",
    pay: "PHP 120-250/hr",
    fit: "Easy entry",
  },
  {
    title: "Customer Support Chat",
    keywords: ["chat", "support", "customer", "english", "night shift", "remote", "home"],
    summary: "Best for clear writers who can answer questions, document issues, and stay calm with customers.",
    pay: "PHP 180-420/hr",
    fit: "Stable schedule",
  },
  {
    title: "Short-form Video Editor",
    keywords: ["video", "editing", "capcut", "tiktok", "reels", "creative", "social media"],
    summary: "Strong option for creative workers who can cut clips, add captions, and improve pacing.",
    pay: "PHP 300-800/hr",
    fit: "Portfolio based",
  },
  {
    title: "Social Media Assistant",
    keywords: ["social", "facebook", "instagram", "canva", "caption", "content", "creative"],
    summary: "Good for people who can create posts, write captions, schedule content, and reply to comments.",
    pay: "PHP 220-550/hr",
    fit: "Creative admin",
  },
  {
    title: "No-code Automation Helper",
    keywords: ["automation", "zapier", "make", "airtable", "technical", "workflow", "forms"],
    summary: "Higher-paying path for people who can connect apps, build workflows, and test simple systems.",
    pay: "PHP 450-1,200/hr",
    fit: "Technical growth",
  },
];

query.addEventListener("input", () => {
  query.style.height = "auto";
  query.style.height = `${query.scrollHeight}px`;
});

let providerConversation = [];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderProviderConversation(conversation) {
  return conversation
    .map((entry) => {
      const label = entry.role === "assistant" ? "Assistant" : "You";
      return `
        <article class="result-card">
          <h2>${label}</h2>
          <p>${escapeHtml(entry.content)}</p>
        </article>
      `;
    })
    .join("");
}

function parseJsonFromString(text) {
  const match = text.match(/\{[\s\S]*\}/m);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    return null;
  }
}

async function callClaudeProvider(userPrompt) {
  const roleButton = document.querySelector('.mode-chip.is-active');
  const role = roleButton ? roleButton.textContent.trim() : 'Job Provider';

  const conversationText = providerConversation
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'Human'}: ${entry.content}`)
    .join('\n');

  const instructions = `You are a guided job posting assistant. Ask the job provider one clarifying question at a time to fill required fields: company_name, contact_details, title, description, skills_required, pay_type (hourly/salary), pay_min, pay_max, work_setup (remote/onsite/hybrid), location (if applicable), and schedule_type (full_time/part_time/contract/flexible).

When you have ALL required fields, respond ONLY with valid JSON in this exact format (no extra text before or after):
{
  "status": "complete",
  "draft": {
    "company_name": "string",
    "contact_details": "string (email or phone)",
    "title": "string",
    "description": "string (explain what person will do)",
    "skills_required": ["skill1", "skill2"],
    "pay_type": "hourly",
    "pay_min": number,
    "pay_max": number,
    "work_setup": "remote|onsite|hybrid",
    "location": "string or null",
    "schedule_type": "full_time|part_time|contract|flexible"
  }
}

If any field is unclear or missing, ask for clarification instead of guessing. Do NOT complete until you have all 11 fields. Company name and contact details are REQUIRED.`;

  const prompt = `${instructions}\n\nRole: ${role}\n${conversationText}\nHuman: ${userPrompt}\nAssistant:`;
  return callClaude(prompt);
}

async function handleJobProviderSubmission(search) {
  providerConversation.push({ role: 'user', content: search });
  results.innerHTML = renderProviderConversation(providerConversation);
  hint.textContent = 'Working with Claude to build your job posting...';

  try {
    const assistantText = await callClaudeProvider(search);
    providerConversation.push({ role: 'assistant', content: assistantText });
    results.innerHTML = renderProviderConversation(providerConversation);

    const parsed = parseJsonFromString(assistantText);
    if (parsed?.status === 'complete' && parsed.draft) {
      hint.textContent = 'Validating job posting for legitimacy...';
      
      // Validate the job posting before saving
      const validationResponse = await fetch('/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.draft),
      });

      if (!validationResponse.ok) {
        hint.textContent = 'Validation service error. Please try again.';
        return;
      }

      const validation = await validationResponse.json();

      if (!validation.is_legitimate) {
        // Rejection: show reason and offer to try again
        results.innerHTML += `
          <article class="result-card" style="border-left: 4px solid #e74c3c;">
            <h2>Posting Rejected</h2>
            <p><strong>Reason:</strong> ${validation.reason}</p>
            <p><strong>Issues found:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${validation.issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
            <p style="margin-top: 15px; font-size: 0.9em; color: #7f8c8d;">
              Please revise your job posting and try again. Make sure all required fields are complete and accurate.
            </p>
          </article>
        `;
        hint.textContent = 'Job posting rejected. See issues above. Please revise and try again.';
        providerConversation = [];
        return;
      }

      // Approval: save to database
      hint.textContent = 'Job posting approved! Saving to database...';
      const message = await saveProviderDraft(search, parsed.draft, 'published');
      
      results.innerHTML += `
        <article class="result-card" style="border-left: 4px solid #27ae60;">
          <h2>✓ Job Posted Successfully!</h2>
          <p>${message}</p>
        </article>
      `;
      hint.textContent = 'Your job has been posted and is now visible to job seekers!';
      providerConversation = [];
      return;
    }

    hint.textContent = "Please answer the assistant's next question to continue the job posting flow.";
  } catch (error) {
    hint.textContent = `Error: ${error.message}`;
  }
}

function isProviderPrompt(text) {
  const providerSignals = [
    "hire",
    "hiring",
    "need someone",
    "looking for someone",
    "looking for a",
    "we need",
    "my business",
    "employee",
    "worker",
    "assistant",
    "editor",
    "support",
  ];

  return providerSignals.some((signal) => text.toLowerCase().includes(signal));
}

async function callClaude(prompt) {
  const roleButton = document.querySelector('.mode-chip.is-active');
  const role = roleButton ? roleButton.textContent.trim() : 'Job Provider';

  const response = await fetch('/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, role }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Claude request failed');
  }

  const data = await response.json();
  return data.answer || 'No response returned from Claude.';
}

function extractProviderDraft(prompt) {
  const lower = prompt.toLowerCase();
  const title = lower.includes("video")
    ? "Short-form Video Editor"
    : lower.includes("social")
      ? "Social Media Assistant"
      : lower.includes("assistant") || lower.includes("admin")
        ? "Virtual Assistant"
        : lower.includes("support") || lower.includes("chat")
          ? "Customer Support Assistant"
          : "Job Provider Request";

  const requiredSkills = [
    lower.includes("video") ? "video editing" : null,
    lower.includes("tiktok") || lower.includes("reels") ? "short-form content" : null,
    lower.includes("canva") ? "Canva" : null,
    lower.includes("english") ? "English communication" : null,
    lower.includes("spreadsheet") || lower.includes("excel") ? "spreadsheets" : null,
  ].filter(Boolean);

  const missingFields = [
    lower.includes("budget") || lower.includes("pay") || lower.includes("php") || lower.includes("₱") ? null : "pay range",
    lower.includes("part-time") || lower.includes("full-time") || lower.includes("freelance") || lower.includes("project") ? null : "schedule type",
    lower.includes("remote") || lower.includes("onsite") || lower.includes("hybrid") || lower.includes("home") ? null : "work setup",
    lower.includes("start") || lower.includes("asap") || lower.includes("next week") ? null : "start date",
    lower.includes("email") || lower.includes("phone") || lower.includes("messenger") ? null : "contact method",
  ].filter(Boolean);

  return {
    title,
    category: lower.includes("video") || lower.includes("social") ? "creative" : "operations",
    description: prompt,
    tasks: [prompt],
    required_skills: requiredSkills,
    work_setup: lower.includes("remote") || lower.includes("home") ? "remote" : null,
    schedule_type: lower.includes("part-time")
      ? "part-time"
      : lower.includes("full-time")
        ? "full-time"
        : lower.includes("freelance")
          ? "freelance"
          : null,
    location: "Philippines",
    missingFields,
  };
}

async function saveProviderDraft(prompt, draft, status = "draft") {
  const headers = {
    apikey: supabaseConfig.publishableKey,
    Authorization: `Bearer ${supabaseConfig.publishableKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const intakeResponse = await fetch(`${supabaseConfig.url}/rest/v1/ai_intake_sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_type: "job_provider",
      raw_prompt: prompt,
      extracted_data: draft,
      missing_fields: draft.missingFields,
      status,
    }),
  });

  if (!intakeResponse.ok) {
    return "Run supabase-schema.sql in Supabase first, then submit again.";
  }

  const [intake] = await intakeResponse.json();
  const jobResponse = await fetch(`${supabaseConfig.url}/rest/v1/job_posts`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      intake_session_id: intake.id,
      company_name: draft.company_name,
      contact_email: draft.contact_details,
      title: draft.title,
      description: draft.description,
      required_skills: draft.skills_required,
      pay_type: draft.pay_type,
      pay_min: draft.pay_min,
      pay_max: draft.pay_max,
      work_setup: draft.work_setup,
      location: draft.location || null,
      schedule_type: draft.schedule_type,
      status: "published",
    }),
  });

  return jobResponse.ok ? "✓ Job successfully published and visible to job seekers!" : "Job saved but could not be published.";
}

function renderProviderDraft(draft) {
  results.innerHTML = `
    <article class="result-card">
      <h2>${draft.title}</h2>
      <p>${draft.description}</p>
      <div class="result-meta">
        <span>${draft.category}</span>
        <span>${draft.work_setup || "Work setup missing"}</span>
        <span>${draft.schedule_type || "Schedule missing"}</span>
      </div>
      <p>Missing: ${draft.missingFields.length ? draft.missingFields.join(", ") : "Ready for review"}</p>
    </article>
  `;
}

function searchWorkDatabase(search) {
  const words = search.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  
  // Combine hardcoded jobs and Supabase jobs
  const allJobs = [...workDatabase, ...supabaseJobs];
  
  return allJobs
    .map((work) => {
      const text = `${work.title} ${work.keywords.join(" ")} ${work.summary}`.toLowerCase();
      const score = words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
      return { ...work, score };
    })
    .filter((work) => work.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const search = query.value.trim();
  if (!search) {
    hint.textContent = "Type what kind of work you want to search for.";
    query.focus();
    return;
  }

  const activeRole = document.querySelector('.mode-chip.is-active')?.textContent.trim() || 'Job Provider';
  if (activeRole === 'Job Provider') {
    handleJobProviderSubmission(search);
    return;
  }

  if (isProviderPrompt(search)) {
    const draft = extractProviderDraft(search);
    renderProviderDraft(draft);
    hint.textContent = "Provider draft created. Saving...";

    saveProviderDraft(search, draft).then((message) => {
      hint.textContent = message;
    });
    return;
  }

  if (search.includes("\n")) {
    hint.textContent = "Sending prompt to Claude...";
    callClaude(search).then((answer) => {
      results.innerHTML = `<article class="result-card"><h2>Claude says</h2><p>${answer}</p></article>`;
      hint.textContent = "Response generated by Claude.";
    }).catch((error) => {
      hint.textContent = `Claude error: ${error.message}`;
      results.innerHTML = "";
    });
    return;
  }

  const matches = searchWorkDatabase(search).slice(0, 5);
  if (!matches.length) {
    hint.textContent = "No close matches yet. Try describing your skills, schedule, or target pay.";
    results.innerHTML = "";
    return;
  }

  hint.textContent = `Found ${matches.length} possible work match${matches.length > 1 ? "es" : ""} (showing up to 5).`;
  results.innerHTML = matches
    .map(
      (work) => `
        <article class="job-card">
          <div class="job-card-header">
            <h2 class="job-card-title">${work.title}</h2>
          </div>
          <p class="job-card-description">${work.summary}</p>
          <div class="job-card-details">
            <div class="job-card-detail work-setup">
              <p class="job-card-detail-label">📍 Work Setup</p>
              <p class="job-card-detail-value">${work.fit || "Flexible"}</p>
            </div>
            <div class="job-card-detail pay-range">
              <p class="job-card-detail-label">💰 Pay Range</p>
              <p class="job-card-detail-value highlight">${work.pay}</p>
            </div>
          </div>
        </article>
      `
    )
    .join("");
});
