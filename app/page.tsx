"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Download, Code2 as Github, Briefcase as Linkedin, Mail, ArrowRight, ChevronRight, Check, Clock, Activity, AlertTriangle, Terminal, FileCode, GitBranch, FileText, Settings, Circle } from 'lucide-react';
import {
  APP_NAME,
  TAGLINE,
  EMAIL,
  LINKEDIN_URL,
  GITHUB_URL,
  RESUME_URL,
} from "@/lib/data";
import { fadeInUp, fadeIn, staggerContainer, scaleIn } from "@/lib/motion";
import { Reveal } from "@/components/Reveal";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CUBE_LAYERS = [
  { id: "unit", label: "Unit" },
  { id: "integration", label: "Integration" },
  { id: "e2e", label: "End-to-End" },
  { id: "performance", label: "Performance" },
];

interface Discipline {
  id: string;
  title: string;
  summary: string;
  approach: string;
}

const EXPERTISE: Discipline[] = [
  {
    id: "functional",
    title: "Functional Testing",
    summary: "Verifying every feature behaves exactly as specified.",
    approach:
      "I map each requirement to a testable condition before writing a single case, then trace UI flows down through the backend so a pass actually means the feature works end to end, not just that a button is clickable.",
  },
  {
    id: "regression",
    title: "Regression Testing",
    summary: "Layered suites that re-check prior behavior before every release.",
    approach:
      "I keep regression suites tiered: a fast smoke pass for every commit, a fuller functional pass before merges, and a deep pass before release, so coverage grows without turning every build into an hour-long wait.",
  },
  {
    id: "api",
    title: "API Testing",
    summary: "Contract and integration validation beyond the UI.",
    approach:
      "I validate status codes, schema shape, and edge-case payloads directly against the contract in Postman and automated scripts, so backend regressions get caught before they ever reach a screen.",
  },
  {
    id: "automation",
    title: "Automation Engineering",
    summary: "Playwright-driven suites wired into the delivery pipeline.",
    approach:
      "I build automation around a page-object structure with clear separation between scenario, script, and assertion, so suites stay readable and a failing test tells you exactly what broke.",
  },
  {
    id: "performance",
    title: "Performance Testing",
    summary: "JMeter load and stress scenarios to catch bottlenecks early.",
    approach:
      "I design load profiles that mirror realistic usage patterns rather than arbitrary spikes, then watch response time and error-rate trends across the run instead of chasing a single pass or fail number.",
  },
  {
    id: "exploratory",
    title: "Exploratory Testing",
    summary: "Structured, charter-based sessions hunting for edge cases.",
    approach:
      "I run time-boxed charters with a clear mission, like 'break the checkout flow with invalid states', and log findings as I go, so exploration stays focused instead of becoming random clicking.",
  },
  {
    id: "cross-browser",
    title: "Cross-Browser & Device Testing",
    summary: "Consistent behavior across a real browser and device matrix.",
    approach:
      "I prioritize the matrix by actual usage data rather than testing everything equally, then automate the high-traffic combinations and manually spot-check the rest.",
  },
  {
    id: "accessibility",
    title: "Accessibility Testing",
    summary: "Keyboard navigation, screen reader flow, and WCAG checks.",
    approach:
      "I test with a keyboard only before I ever touch a mouse, then verify landmark structure and labeling with a screen reader, catching the gaps that automated scanners alone tend to miss.",
  },
  {
    id: "test-data",
    title: "Test Data Management",
    summary: "Reusable, isolated datasets that keep suites deterministic.",
    approach:
      "I keep fixtures small and composable rather than one giant shared database, so tests stay deterministic and a failure in one suite never cascades into unrelated ones.",
  },
  {
    id: "defect-reporting",
    title: "Defect Reporting & Verification",
    summary: "Reports developers can act on without back-and-forth.",
    approach:
      "Every report I write includes reproducible steps, environment, expected versus actual behavior, and evidence, then I verify the fix myself against the original repro before closing it out.",
  },
];

interface WorkflowStep {
  id: string;
  label: string;
  icon: typeof FileText;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "requirement", label: "Requirement", icon: FileText },
  { id: "scenario", label: "Test Scenario", icon: GitBranch },
  { id: "script", label: "Playwright Script", icon: FileCode },
  { id: "execution", label: "Browser Execution", icon: Terminal },
  { id: "assertion", label: "Assertion", icon: Check },
  { id: "report", label: "Report", icon: Activity },
  { id: "regression", label: "Regression Coverage", icon: Settings },
];

const PLAYWRIGHT_SAMPLE = `import { test, expect } from '@playwright/test';

test('user can complete checkout with saved card', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByLabel('Card number').fill('4242 4242 4242 4242');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByText('Order confirmed')).toBeVisible();
  await expect(page).toHaveURL(/\\/orders\\/\\d+/);
});`;

interface LabCard {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
}

const LAB_CARDS: LabCard[] = [
  {
    id: "playwright",
    title: "Playwright Automation",
    description:
      "Browser suites structured around page objects, with scenario and assertion kept separate so failures are easy to diagnose.",
    icon: Terminal,
  },
  {
    id: "postman",
    title: "API Validation with Postman",
    description:
      "Collections that check status codes, schema shape, and negative cases, wired into pre-release checks before UI testing starts.",
    icon: FileCode,
  },
  {
    id: "jmeter",
    title: "JMeter Performance Testing",
    description:
      "Load profiles built from realistic usage patterns, run in approved QA environments to surface bottlenecks early.",
    icon: Activity,
  },
  {
    id: "regression-design",
    title: "Regression Suite Design",
    description:
      "Tiered suites from smoke to full regression, so coverage grows with the product instead of slowing every commit down.",
    icon: GitBranch,
  },
  {
    id: "test-data-structure",
    title: "Reusable Test Data & Structure",
    description:
      "Small, composable fixtures and a consistent folder structure that keep suites deterministic and easy to extend.",
    icon: Settings,
  },
  {
    id: "failure-evidence",
    title: "Failure Evidence & Reporting",
    description:
      "Screenshots, traces, and clear repro steps attached to every failing check, so developers can act without chasing context.",
    icon: FileText,
  },
];

type DemoStatus = "Queued" | "Running" | "Passed" | "Needs Review";

interface DemoCheck {
  id: string;
  name: string;
  status: DemoStatus;
}

const INITIAL_DEMO_CHECKS: DemoCheck[] = [
  { id: "check-1", name: "Checkout with saved card", status: "Queued" },
  { id: "check-2", name: "Login with invalid password", status: "Queued" },
  { id: "check-3", name: "API: create order schema", status: "Queued" },
  { id: "check-4", name: "Role-based access to admin panel", status: "Queued" },
];

const STATUS_SEQUENCE: DemoStatus[] = ["Queued", "Running", "Passed", "Needs Review"];

const STATUS_STYLES: Record<DemoStatus, { badge: string; icon: typeof Clock; dot: string }> = {
  Queued: {
    badge: "bg-white/5 text-[var(--muted-foreground)] border-white/10",
    icon: Clock,
    dot: "bg-white/30",
  },
  Running: {
    badge: "bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30",
    icon: Activity,
    dot: "bg-[var(--accent-secondary)]",
  },
  Passed: {
    badge: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30",
    icon: Check,
    dot: "bg-[var(--primary)]",
  },
  "Needs Review": {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: AlertTriangle,
    dot: "bg-amber-400",
  },
};

interface TimelineItem {
  text: string;
}

const TIMELINE_RESPONSIBILITIES: TimelineItem[] = [
  { text: "Test web, mobile, and desktop applications throughout the development lifecycle." },
  { text: "Design and execute manual and automated test scenarios." },
  { text: "Build and maintain Playwright browser automation." },
  { text: "Validate APIs and backend behavior using Postman." },
  { text: "Perform performance and load-testing exercises with JMeter in approved QA environments." },
  { text: "Investigate defects and document reproducible steps, evidence, expected behavior, and actual behavior." },
  { text: "Verify fixes and execute regression testing before releases." },
  { text: "Collaborate with developers and product stakeholders to clarify requirements and reduce release risk." },
  { text: "Test complex workflows involving authentication, role-based access, payments, KYC verification, cloud file imports, encryption-related behavior, real-time chat, and AI-generated content." },
];

interface CaseStudy {
  id: string;
  name: string;
  url?: string;
  context: string;
  challenge: string;
  responsibility: string;
  approach: string;
  scenarios: string[];
  tools: string[];
  learned: string;
  roadmap?: boolean;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "atomic-builder",
    name: "Atomic Builder",
    url: "https://builder.hotcode.ai/",
    context:
      "An AI-powered product builder where users describe what they want and the platform generates working output through a multi-step flow.",
    challenge:
      "Generation-based products carry a different kind of risk than standard CRUD apps: state can hang in a generating step, errors need graceful fallback, and every project workflow has to stay predictable across retries.",
    responsibility:
      "I tested the end-to-end user journey, from authentication through project creation to generation states, looking for ways the flow could break or mislead the user.",
    approach:
      "I combined scripted functional cases for the core happy path with exploratory sessions targeting interrupted actions, like closing a tab mid-generation or submitting invalid input, then checked how the UI recovered.",
    scenarios: [
      "Multi-step authentication and session handling",
      "Project creation and generation state transitions",
      "Form validation and error handling on bad input",
      "Loading, timeout, and retry behavior",
      "Responsive layout across breakpoints",
      "Regression risk when new generation features shipped",
    ],
    tools: ["Playwright", "Manual exploratory testing", "Browser DevTools"],
    learned:
      "Generation-based UIs need test design that treats 'in progress' as a first-class state, not an edge case, because that is where most real user frustration shows up.",
  },
  {
    id: "veridat-ai",
    name: "VeridatAI",
    url: "https://veridat-demo.daticsai.com/",
    context:
      "A platform handling identity and KYC-style verification workflows, including document upload, validation, and role-based access to sensitive records.",
    challenge:
      "Verification flows need to reject malformed or fraudulent input confidently without blocking legitimate users, and access to sensitive data has to be strictly scoped by role.",
    responsibility:
      "I tested document handling, validation rules, and role-based access paths, with a focus on negative scenarios that a happy-path test plan would miss.",
    approach:
      "I built a matrix of valid, borderline, and invalid document and data combinations, then walked through each role's permissions to confirm no account could see or act beyond its scope.",
    scenarios: [
      "Document upload and format validation",
      "Identity verification edge cases and rejected submissions",
      "Role-based access boundaries across user types",
      "Encryption-related behavior on sensitive fields",
      "Usability of multi-step verification forms",
      "Negative testing for incomplete or fraudulent-looking input",
    ],
    tools: ["Manual testing", "Postman", "Browser DevTools"],
    learned:
      "With identity-sensitive workflows, the negative and boundary cases matter more than the happy path. That is where access-control and validation gaps actually live.",
  },
  {
    id: "qa-assistant",
    name: "QA Assistant",
    context:
      "A personal AI-assisted QA prototype. The working core accepts a QA-related request and returns structured guidance, like suggested test cases or risk areas for a described feature.",
    challenge:
      "Turning a plain-language QA request into structured, genuinely useful output, while keeping the system honest about what it can and cannot do yet.",
    responsibility:
      "I designed and tested the current request-to-response pipeline, and I am shaping the roadmap for what gets built next.",
    approach:
      "I test the current LLM pipeline with varied QA prompts, from vague feature descriptions to detailed specs, checking that the structured output stays consistent and useful.",
    scenarios: [
      "Vague versus detailed QA requests",
      "Structured response consistency across prompt styles",
      "Handling of unsupported or out-of-scope requests",
    ],
    tools: ["Manual testing", "Prompt iteration"],
    learned:
      "A believable AI-assisted tool should be upfront about what is built versus planned. Overselling early capability erodes trust fast.",
  },
  {
    id: "library-management",
    name: "Library Management System",
    context:
      "An academic full-stack project covering authentication, admin access, book catalog management, issue and return workflows, fines, and due dates.",
    challenge:
      "Keeping book inventory, issue records, and fine calculations in sync as users check items in and out, with admin and member roles behaving differently.",
    responsibility:
      "This was development work, not professional QA experience. I built and tested the application myself as part of coursework.",
    approach:
      "I wrote functional tests for the core flows and manually verified database state after each transaction, since the whole point was catching sync issues between the book catalog and issue records.",
    scenarios: [
      "Authentication and admin-versus-member access",
      "Book issue, return, and overdue fine calculation",
      "Due date tracking and record updates",
      "Database synchronization after concurrent actions",
    ],
    tools: ["Manual testing", "SQL verification"],
    learned:
      "Building the system myself first made me a better tester later. I understood exactly which edge cases around state and timing were worth checking.",
  },
];

const QA_ASSISTANT_FLOW = ["User Request", "QA Workflow", "LLM Processing", "Structured QA Response"];
const QA_ASSISTANT_ROADMAP = [
  "Full RAG over project documentation",
  "Database persistence for request history",
  "Browser execution of suggested test cases",
  "Multi-agent collaboration between QA roles",
  "Production deployment",
];

interface SystemNode {
  id: string;
  label: string;
  risks: string;
  perspective: string;
}

const SYSTEM_NODES: SystemNode[] = [
  {
    id: "authentication",
    label: "Authentication",
    risks: "Session expiry handled inconsistently, password reset abuse, weak lockout behavior.",
    perspective:
      "I check session boundaries deliberately, what happens on token expiry mid-action, concurrent logins, and failed-attempt lockouts, not just the login form itself.",
  },
  {
    id: "payments",
    label: "Payments",
    risks: "Double charges on retry, failed payment states left unclear to the user, currency rounding errors.",
    perspective:
      "I focus on the failure paths: declined cards, network drop mid-transaction, and retry logic, since that is where money gets lost or users get confused.",
  },
  {
    id: "kyc",
    label: "KYC Verification",
    risks: "False rejections of valid documents, unclear rejection reasons, inconsistent manual review handoff.",
    perspective:
      "I test with a spread of valid, borderline, and clearly invalid documents, and I verify the user always gets a clear next step, not a dead end.",
  },
  {
    id: "rbac",
    label: "Role-Based Access",
    risks: "Privilege leaks between roles, UI hiding an action without the backend actually blocking it.",
    perspective:
      "I always test the backend call directly, not just whether a button is hidden, because a hidden button is not the same as an enforced permission.",
  },
  {
    id: "cloud-imports",
    label: "Cloud File Imports",
    risks: "Large file timeouts, partial imports left in an inconsistent state, unsupported file formats.",
    perspective:
      "I test with oversized files, mid-import network loss, and malformed files, then confirm the system either completes cleanly or rolls back, never leaves a half-imported state.",
  },
  {
    id: "real-time-chat",
    label: "Real-Time Chat",
    risks: "Message ordering under latency, delivery confirmation gaps, reconnect handling after a dropped connection.",
    perspective:
      "I test with simulated latency and forced disconnects to see whether messages arrive in order and whether the UI is honest about delivery status.",
  },
  {
    id: "ai-generated-content",
    label: "AI-Generated Content",
    risks: "Inconsistent output formatting, silent failures on unsupported prompts, unclear loading and retry states.",
    perspective:
      "I treat generation output as untrusted input to the rest of the UI. I check how the app handles malformed, empty, or unexpectedly long responses.",
  },
  {
    id: "data-validation",
    label: "Data Validation",
    risks: "Client-side-only validation, inconsistent error messaging, boundary values accepted incorrectly.",
    perspective:
      "I always re-send a request past the client validation layer, directly to the API, to confirm the backend enforces the same rules.",
  },
  {
    id: "error-recovery",
    label: "Error Recovery",
    risks: "Dead-end error screens, lost form input on failure, unclear retry paths.",
    perspective:
      "I check that an error never costs the user their progress. Form data should survive a failed submission, and there should always be an obvious next step.",
  },
  {
    id: "cross-platform",
    label: "Cross-Platform Behavior",
    risks: "Layout breakage on specific viewport widths, inconsistent touch targets, platform-specific input quirks.",
    perspective:
      "I prioritize real usage data over testing every combination equally, automating the high-traffic breakpoints and spot-checking the rest manually.",
  },
];

interface ToolGroup {
  heading: string;
  items: string[];
}

const TOOL_GROUPS: ToolGroup[] = [
  { heading: "Automation", items: ["Playwright"] },
  { heading: "API & Performance", items: ["Postman", "JMeter"] },
  {
    heading: "Testing",
    items: [
      "Manual testing",
      "Functional testing",
      "Regression testing",
      "Exploratory testing",
      "Usability testing",
      "Compatibility testing",
    ],
  },
  {
    heading: "Technical Foundation",
    items: [
      "Front-end development knowledge",
      "Web application architecture",
      "Browser developer tools",
      "AI & agentic workflow fundamentals",
    ],
  },
];

interface Principle {
  title: string;
  text: string;
}

const PRINCIPLES: Principle[] = [
  {
    title: "Understand the user journey before writing test cases.",
    text: "I map how a real person actually moves through a feature before I write a single scripted step, so coverage reflects real usage instead of an assumption about it.",
  },
  {
    title: "Test beyond the happy path.",
    text: "The happy path is usually the least interesting part of the system. I spend more time on interrupted flows, invalid input, and unexpected navigation.",
  },
  {
    title: "Make every defect easy to reproduce.",
    text: "A bug report that a developer has to decode is a bug report that gets deprioritized. I write steps, evidence, and expected-versus-actual clearly enough that anyone can reproduce it cold.",
  },
  {
    title: "Automate stable, valuable regression paths, not everything blindly.",
    text: "Automation is an investment, not a checkbox. I automate the paths that are stable and high-value, and I leave exploratory judgment to a human where it actually matters.",
  },
];

// ---------------------------------------------------------------------------
// 3D hero cube
// ---------------------------------------------------------------------------

function QualityCube() {
  const reduceMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 60, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 60, damping: 18 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const handlePointerMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(relX * 18);
      rotateX.set(-relY * 18);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reduceMotion, rotateX, rotateY]);

  useEffect(() => {
    if (reduceMotion || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      rotateY.set(Math.max(-18, Math.min(18, e.gamma / 2)));
      rotateX.set(Math.max(-18, Math.min(18, (e.beta - 45) / 2)));
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [reduceMotion, rotateX, rotateY]);

  const cycleLayer = useMemo(() => {
    if (reduceMotion || !mounted) return null;
    return CUBE_LAYERS[Math.floor(Date.now() / 2400) % CUBE_LAYERS.length]?.id ?? null;
  }, [reduceMotion, mounted]);

  useEffect(() => {
    if (reduceMotion || !mounted) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % CUBE_LAYERS.length;
      setActiveLayer(CUBE_LAYERS[index]?.id ?? null);
    }, 2400);
    return () => clearInterval(interval);
  }, [reduceMotion, mounted]);

  if (!mounted) {
    return (
      <div className="flex h-72 w-72 items-center justify-center rounded-2xl border border-[var(--border)]/60 bg-white/[0.02]">
        <div className="h-40 w-40 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80"
        style={{ perspective: "900px" }}
      >
        <motion.div
          className="relative h-48 w-48 sm:h-56 sm:w-56"
          style={{
            transformStyle: "preserve-3d",
            rotateX: reduceMotion ? 0 : springX,
            rotateY: reduceMotion ? 0 : springY,
          }}
          animate={reduceMotion ? {} : { rotateZ: [0, 2, 0, -2, 0] }}
          transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          {CUBE_LAYERS.map((layer, index) => {
            const isActive = activeLayer === layer.id;
            const offset = (index - (CUBE_LAYERS.length - 1) / 2) * 22;
            return (
              <div
                key={layer.id}
                className={`absolute inset-4 rounded-xl border transition-colors duration-700 ${
                  isActive
                    ? "border-[var(--primary)]/70 bg-[var(--primary)]/10 shadow-[0_0_40px_-10px_rgba(62,232,219,0.5)]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
                style={{
                  transform: `translateZ(${offset}px)`,
                }}
              >
                <span
                  className={`absolute left-2 top-2 text-[10px] uppercase tracking-wider transition-colors duration-700 ${
                    isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {layer.label}
                </span>
              </div>
            );
          })}
          {!reduceMotion && (
            <motion.div
              className="absolute inset-x-4 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/70 to-transparent"
              style={{ transform: "translateZ(30px)" }}
              animate={{ top: ["8%", "92%", "8%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>
      <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-[var(--muted-foreground)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
        Testing beyond the happy path.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section pieces
// ---------------------------------------------------------------------------

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
      {children}
    </span>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <SectionKicker>{kicker}</SectionKicker>
      <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty leading-relaxed text-[var(--muted-foreground)]">{description}</p>
      ) : null}
    </div>
  );
}

function IconBox({ icon: Icon }: { icon: typeof FileText }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--primary)]/25 bg-[var(--primary)]/10 text-[var(--primary)]">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export default function Home() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(EXPERTISE[0].id);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string>(SYSTEM_NODES[0].id);
  const [demoChecks, setDemoChecks] = useState<DemoCheck[]>(INITIAL_DEMO_CHECKS);
  const [demoRunning, setDemoRunning] = useState(false);
  const [qaFlowStep, setQaFlowStep] = useState(0);

  const activeDiscipline = useMemo(
    () => EXPERTISE.find((item) => item.id === selectedDiscipline) ?? EXPERTISE[0],
    [selectedDiscipline]
  );

  const activeNode = useMemo(
    () => SYSTEM_NODES.find((node) => node.id === selectedNode) ?? SYSTEM_NODES[0],
    [selectedNode]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setQaFlowStep((prev) => (prev + 1) % QA_ASSISTANT_FLOW.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const runDemo = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoChecks(INITIAL_DEMO_CHECKS.map((check) => ({ ...check, status: "Queued" })));

    INITIAL_DEMO_CHECKS.forEach((check, checkIndex) => {
      STATUS_SEQUENCE.forEach((status, statusIndex) => {
        const finalStatus: DemoStatus =
          checkIndex % 3 === 2 && status === "Passed" ? "Needs Review" : status;
        setTimeout(() => {
          setDemoChecks((prev) =>
            prev.map((item) => (item.id === check.id ? { ...item, status: finalStatus } : item))
          );
          if (checkIndex === INITIAL_DEMO_CHECKS.length - 1 && statusIndex === STATUS_SEQUENCE.length - 1) {
            setDemoRunning(false);
          }
        }, (checkIndex * 350) + statusIndex * 650);
      });
    });
  };

  return (
    <main className="bg-ambient min-h-screen overflow-x-hidden pt-24 text-[var(--foreground)]">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start gap-5"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/60 bg-white/[0.03] px-3.5 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)]/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Based in Lahore, Pakistan
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-balance font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {APP_NAME}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--primary)] sm:text-xl"
            >
              {TAGLINE}
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="max-w-xl text-pretty text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg"
            >
              I test products from the user&apos;s perspective and the system&apos;s edge
              cases, turning unclear behavior into reproducible bugs, reliable automated
              checks, and better releases.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-2 flex flex-wrap items-center gap-3">
              <a
                href="#case-studies"
                className="btn-primary-glow inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[#0B0E11] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60"
              >
                View My Work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={RESUME_URL}
                download
                className="btn-secondary-outline inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Résumé
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-2 flex flex-wrap items-center gap-5 text-sm text-[var(--muted-foreground)]"
            >
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[var(--foreground)]"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[var(--foreground)]"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[var(--foreground)]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {EMAIL}
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center lg:justify-end"
          >
            <QualityCube />
          </motion.div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-6xl" />

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeading kicker="About" title="Quality work, grounded in practice" />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div className="space-y-5 text-pretty leading-relaxed text-[var(--muted-foreground)]">
              <p>
                I currently work at <span className="text-[var(--foreground)]">DaticsAI</span>,
                where I test web, mobile, and desktop applications across the development
                lifecycle. Most of my week is split between manual exploratory sessions,
                Playwright automation, and keeping regression suites healthy as the product
                changes underneath them.
              </p>
              <p>
                My day-to-day covers browser automation, API validation, performance checks
                with JMeter, and defect investigation, writing up reproducible steps, expected
                versus actual behavior, and the evidence a developer needs to act without
                asking follow-up questions. I work closely with developers and product
                stakeholders to clarify requirements before they turn into bugs.
              </p>
              <p>
                Before focusing on QA, I spent time doing front-end development, and that
                background still shows up in how I work. I can read a component tree, trace a
                rendering issue, and talk to a development team in terms they do not have to
                translate for me.
              </p>
            </div>
            <div className="glass-panel p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                What I bring
              </h3>
              <ul className="mt-5 space-y-4">
                {[
                  "Manual and automation testing across web, mobile, and desktop",
                  "Playwright browser automation and API testing with Postman",
                  "Performance and load testing with JMeter",
                  "Clear defect reporting developers can act on directly",
                  "Front-end literacy for faster UI investigation",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Testing expertise matrix */}
      <section id="expertise-matrix" className="border-t border-[var(--border)]/40 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              kicker="Testing Expertise"
              title="Ten disciplines, one practical approach"
              description="Select an area to see how I actually approach it, not a textbook definition."
            />
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.3fr]">
            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                {EXPERTISE.map((item) => {
                  const isActive = item.id === selectedDiscipline;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDiscipline(item.id)}
                      aria-pressed={isActive}
                      className={`rounded-xl border p-4 text-left text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 ${
                        isActive
                          ? "border-[var(--primary)]/60 bg-[var(--primary)]/10 text-[var(--foreground)] shadow-[0_0_28px_-10px_rgba(62,232,219,0.4)]"
                          : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)] hover:border-white/20 hover:text-[var(--foreground)]"
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass-panel h-full p-6 md:p-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  {activeDiscipline.title}
                </span>
                <p className="mt-3 text-base font-medium text-[var(--foreground)]">
                  {activeDiscipline.summary}
                </p>
                <p className="mt-4 text-pretty leading-relaxed text-[var(--muted-foreground)]">
                  {activeDiscipline.approach}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Automation lab */}
      <section id="automation-lab" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeading
            kicker="Automation Lab"
            title="From requirement to regression coverage"
            description="A realistic Playwright workflow, from the first requirement to coverage that protects future releases."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-10 flex flex-wrap items-stretch gap-3"
          >
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeWorkflowStep === step.id;
              return (
                <motion.div key={step.id} variants={fadeInUp} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveWorkflowStep(isActive ? null : step.id)}
                    aria-pressed={isActive}
                    className={`glass-panel flex min-h-11 items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 ${
                      isActive
                        ? "border-[var(--primary)]/60 bg-[var(--primary)]/10 text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-[var(--primary)]" : ""}`} aria-hidden="true" />
                    {step.label}
                  </button>
                  {index < WORKFLOW_STEPS.length - 1 ? (
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]/50" aria-hidden="true" />
                  ) : null}
                </motion.div>
              );
            })}
          </motion.div>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-10">
          <Reveal delay={0.1}>
            <div className="glass-panel overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]/70" />
                <span className="ml-2 text-xs text-[var(--muted-foreground)]">checkout.spec.ts</span>
              </div>
              <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
                <code>
                  <span className="text-[var(--primary)]">import</span>{" "}
                  {"{ test, expect } "}
                  <span className="text-[var(--primary)]">from</span> &apos;@playwright/test&apos;;
                  {"\n\n"}
                  <span className="text-[var(--primary)]">test</span>
                  {"('user can complete checkout with saved card', async ({ page }) => {\n"}
                  {"  await page.goto('/checkout');\n"}
                  {"  await page.getByLabel('Card number').fill('4242 4242 4242 4242');\n"}
                  {"  await page.getByRole('button', { name: 'Place order' }).click();\n\n"}
                  {"  await expect(page.getByText('Order confirmed')).toBeVisible();\n"}
                  {"  await expect(page).toHaveURL(/\\/orders\\/\\d+/);\n"}
                  {"});"}
                </code>
              </pre>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Interactive demonstration
                </h3>
                <button
                  type="button"
                  onClick={runDemo}
                  disabled={demoRunning}
                  className="btn-secondary-outline inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {demoRunning ? "Running…" : "Run demo"}
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Fictional checks for illustration only, not live production data.
              </p>
              <ul className="mt-5 space-y-3">
                {demoChecks.map((check) => {
                  const style = STATUS_STYLES[check.status];
                  const StatusIcon = style.icon;
                  return (
                    <li
                      key={check.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm text-[var(--foreground)]">{check.name}</span>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                      >
                        <StatusIcon className="h-3 w-3" aria-hidden="true" />
                        {check.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {LAB_CARDS.map((card) => (
            <motion.div
              key={card.id}
              variants={fadeInUp}
              className="glass-panel glass-panel-hover p-6 md:p-8"
            >
              <IconBox icon={card.icon} />
              <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">{card.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Case studies */}
      <section id="case-studies" className="border-t border-[var(--border)]/40 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              kicker="Case Studies"
              title="Products, not just checklists"
              description="Story-based breakdowns of what I actually tested, not generic project cards."
            />
          </Reveal>

          <div className="mt-12 space-y-10">
            {CASE_STUDIES.map((study, index) => (
              <Reveal key={study.id} delay={index * 0.05}>
                <div className="glass-panel p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
                      {study.name}
                    </h3>
                    {study.url ? (
                      <a
                        href={study.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors duration-200 hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]"
                      >
                        Visit site
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="rounded-full border border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-secondary)]">
                        Personal project
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid gap-8 lg:grid-cols-2">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Product context
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{study.context}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Quality challenge
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Rao&apos;s responsibility
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                          {study.responsibility}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Testing approach
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{study.approach}</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Important scenarios
                        </h4>
                        <ul className="mt-2 space-y-1.5">
                          {study.scenarios.map((scenario) => (
                            <li
                              key={scenario}
                              className="flex gap-2 text-sm leading-relaxed text-[var(--muted-foreground)]"
                            >
                              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                              <span>{scenario}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          Tools used
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {study.tools.map((tool) => (
                            <span
                              key={tool}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          What was learned
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{study.learned}</p>
                      </div>
                    </div>
                  </div>

                  {study.id === "qa-assistant" ? (
                    <div className="mt-8 border-t border-white/10 pt-8">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                        Architecture, how a request flows
                      </h4>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {QA_ASSISTANT_FLOW.map((step, stepIndex) => (
                          <div key={step} className="flex items-center gap-3">
                            <span
                              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors duration-500 ${
                                qaFlowStep === stepIndex
                                  ? "border-[var(--primary)]/60 bg-[var(--primary)]/10 text-[var(--foreground)]"
                                  : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)]"
                              }`}
                            >
                              {step}
                            </span>
                            {stepIndex < QA_ASSISTANT_FLOW.length - 1 ? (
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]/50" aria-hidden="true" />
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/5 p-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-secondary)]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-secondary)]">
                          Roadmap, not yet built
                        </span>
                        <ul className="mt-3 space-y-1.5">
                          {QA_ASSISTANT_ROADMAP.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2 text-sm leading-relaxed text-[var(--muted-foreground)]"
                            >
                              <ChevronRight
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-secondary)]"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Systems tested */}
      <section id="systems-tested" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeading
            kicker="Systems I Have Tested"
            title="Complex workflows, broken down by risk"
            description="Select a system to see its common quality risks and how I approach testing it."
          />
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SYSTEM_NODES.map((node) => {
                const isActive = node.id === selectedNode;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node.id)}
                    aria-pressed={isActive}
                    className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 ${
                      isActive
                        ? "border-[var(--primary)]/60 bg-[var(--primary)]/10 text-[var(--foreground)]"
                        : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)] hover:border-white/20 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {node.label}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-panel h-full p-6 md:p-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                {activeNode.label}
              </span>
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-secondary)]">
                  Common risks
                </h4>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {activeNode.risks}
                </p>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  My testing perspective
                </h4>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {activeNode.perspective}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Experience timeline */}
      <section id="experience-timeline" className="border-t border-[var(--border)]/40 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              kicker="Professional Experience"
              title="Software Development Engineer in Test, DaticsAI"
            />
          </Reveal>

          <div className="mt-10 max-w-3xl">
            <ol className="relative space-y-7 border-l border-white/10 pl-8">
              {TIMELINE_RESPONSIBILITIES.map((item, index) => (
                <Reveal key={item.text} delay={index * 0.04}>
                  <li className="relative">
                    <span className="absolute -left-[2.35rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--background)] bg-[var(--primary)]" />
                    <p className="text-pretty text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                      {item.text}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Tools and skills */}
      <section id="tools-skills" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <SectionHeading kicker="Tools & Skills" title="Organized by what they actually do" />
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TOOL_GROUPS.map((group) => (
            <motion.div
              key={group.heading}
              variants={fadeInUp}
              className="glass-panel glass-panel-hover p-6 md:p-8"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-[var(--foreground)]">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Quality principles */}
      <section id="quality-principles" className="border-t border-[var(--border)]/40 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading kicker="How I Think About Quality" title="Four principles that guide my work" />
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-10 grid gap-6 sm:grid-cols-2"
          >
            {PRINCIPLES.map((principle, index) => (
              <motion.div
                key={principle.title}
                variants={fadeInUp}
                className="glass-panel glass-panel-hover p-6 md:p-8"
              >
                <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--primary)]/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold text-[var(--foreground)]">{principle.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {principle.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <div className="glass-panel flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div className="max-w-xl">
              <SectionKicker>Get in touch</SectionKicker>
              <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Let&apos;s talk about your release risk
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-[var(--muted-foreground)]">
                Open to SDET and QA roles. Reach out by email or connect on LinkedIn, I
                read every message myself.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${EMAIL}`}
                className="btn-primary-glow inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[#0B0E11] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email Me
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary-outline inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
